/**
 * Utils donde se declaran las funciones para consultar precios en la API, modificar mi portafolio, conocer las modificaciones
 * @module utils
 */

const nodeFetch = require('node-fetch');
/**
 * Token para la api de precios de acciones
 * @type {string}
 */
const APItoken = "Tpk_1badc8b21aef42e39c473a518f595363"

/**
 * 
 * @param {{name: string, targetPortafolio: number, assets: Array<number|string> }} miPortafolio Portafolio a consultar precios de acciones de los assets
 * @returns {{portafolio_prices: Array, total: number}} Devuelve un objeto pricesAndTotal con propiedades total que corresponde a la suma total del portafolio 
 * y prices con la lista de precios de cada asset
 */
const sharesPricesAndAdder = async(miPortafolio) => {
    let total = 0;
    const prices = await Promise.all(miPortafolio.assets.map(async(asset)=>{
        const APIurl = `https://sandbox.iexapis.com/stable/stock/${asset.symbol}/price/tops?token=${APItoken}`;
        const response = await nodeFetch(APIurl);
        const price = await response.json();
        return price
    }));
    const pricesAndSymbol = [];
    for (let i = 0; i < miPortafolio.assets.length; i++) {
        const priceAndSymbol ={
            symbol: miPortafolio.assets[i].symbol,
            price: prices[i]
        };
        pricesAndSymbol.push(priceAndSymbol);
       total += miPortafolio.assets[i].shares*prices[i];  
    }
    const pricesAndTotal = {
        portafolio_prices: pricesAndSymbol,
        total: Math.round(total)
    }
    return pricesAndTotal
};
/**
 * En esta función se compara el portafolio con el portafolio objetivo, y a partir de este se modifican algunos assets.
 * Quedarán pendientes por validar los assets que no se encuentran dentro del portafolio objetivo.
 * Retorna un arreglo de modificaciones
 * @param {{name: string, assets: Array<number|string> }} portafolioObj Portafolio objetivo usado para validar y comparar los assets presentes en miPortafolio
 * @param {{name: string, targetPortafolio: number, assets: Array<number|string> }} miPortafolio Portafolio a modificar comparando con portafolio objetivo
 * @param {{portafolio_prices: Array, total: number}} totalAmount Objeto con la lista de precios de miPortafolio y el valor total del portafolio
 * @returns {Array<Object>} Devuelve una lista de objetos en los cuales se registran las modificaciones del portafolio 
 */
const comparativeObjectiveAmount = (portafolioObj,miPortafolio,totalAmount) => {
    const modifications = [];
    portafolioObj.assets.forEach(asset => {
        const assetEnMiPortafolio = miPortafolio.assets.find( u => u.symbol === asset.symbol);
        if (assetEnMiPortafolio) {
            const assetPrice = totalAmount.portafolio_prices.find(u => u.symbol === assetEnMiPortafolio.symbol);
            const assetPorcentageEnMiPorta = Math.round(((assetPrice.price*assetEnMiPortafolio.shares)*100)/totalAmount.total);
            if (asset.percentage > assetPorcentageEnMiPorta) {
                const newAmountShares =parseFloat((((asset.percentage*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                const newModification = {
                    symbol: asset.symbol,
                    type: "buying",
                    shares: parseFloat((newAmountShares - assetEnMiPortafolio.shares).toFixed(2)),
                    price: assetPrice.price
                };
                modifications.push(newModification);
                assetEnMiPortafolio.shares = newAmountShares;
                assetEnMiPortafolio.validated = true;
            } else if (asset.percentage < assetPorcentageEnMiPorta) {
                const newAmountShares =parseFloat((((asset.percentage*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                const newModification = {
                    symbol: asset.symbol,
                    type: "selling",
                    shares: parseFloat((assetEnMiPortafolio.shares -  newAmountShares).toFixed(2)),
                    price: assetPrice.price
                };
                modifications.push(newModification);
                assetEnMiPortafolio.shares = newAmountShares;
                assetEnMiPortafolio.validated = true;
            } else {
                const newModification = {
                    symbol: asset.symbol,
                    type: "nothing",
                    shares: 0,
                    price: assetPrice.price
                };
                modifications.push(newModification);
                assetEnMiPortafolio.validated = true;
            }
        } else {
            const moneyForAsset = (totalAmount.total*asset.percentage)/100;
            const newAsset = {
                symbol: `${asset.symbol}`,
                money_avaible: moneyForAsset,
                validated: false
            };
            const newModification = {
                symbol: asset.symbol,
                type: "buying",
            };
            modifications.push(newModification);
            miPortafolio.assets.push(newAsset);
        }
    });
    return modifications
};
/**
 * 
 * @param {{name: string, targetPortafolio: number, assets: Array<number|string> }} miPortafolio En este apartado ya se usa como base este objeto,
 * dado que ahora se terminará de validar los assets que quedaron por validar y terminar de vender o comprar para cumplir con el portafolio objetivo. 
 * @param {{name: string, assets: Array<number|string> }} portafolioObj En este apartado se usa solo para comprobar el porcentaje que se requiere cubrir para el portafolio
 * @param {{portafolio_prices: Array, total: number}} totalAmount Objeto donde se almacena el valor total del portafolio y los precios de los assets del portafolo original
 * @param {Array<Object>} modifcations Lista de modificaciones la cual es requerida en este punto, para seguir registrando las modificaciones que se presenten en este punto
 */
const buyingOrSellingAssets = async(miPortafolio, portafolioObj, totalAmount, modifcations) => {
    let totalPercentage = 0;
    portafolioObj.assets.forEach(asset=>{
        totalPercentage+= asset.percentage;
    });
    const assetsToBuy = miPortafolio.assets.filter(asset => asset.validated == false);
    const assetsNotChecked = miPortafolio.assets.filter(asset => asset.validated == undefined);
    await Promise.all(assetsToBuy.map(async(asset)=>{
        const APIurl = `https://sandbox.iexapis.com/stable/stock/${asset.symbol}/price/tops?token=${APItoken}`;
        const response = await nodeFetch(APIurl);
        const price = await response.json();
        asset.shares = parseFloat((asset.money_avaible/price).toFixed(2));
        asset.validated = true;
        delete asset.money_avaible;
        const modification = modifcations.find( u=> u.symbol == asset.symbol );
        modification.shares = asset.shares;
        modification.price = price;
    }));
    if (totalPercentage != 100) {
        const percentagePerAsset = (100 - totalPercentage)/assetsNotChecked.length;
        assetsNotChecked.forEach(asset => {
            const assetPrice = totalAmount.portafolio_prices.find(u => u.symbol === asset.symbol);
            const assetPorcentageEnMiPorta = Math.round(((assetPrice.price*asset.shares)*100)/totalAmount.total);
            if (percentagePerAsset > assetPorcentageEnMiPorta) {
                const newAmountShares =parseFloat((((percentagePerAsset*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                const newModification = {
                    symbol: asset.symbol,
                    type: "buying",
                    shares: parseFloat((newAmountShares - asset.shares).toFixed(2)),
                    price: assetPrice.price
                };
                modifcations.push(newModification);
                asset.shares = newAmountShares;
                asset.validated = true;
            } else if (percentagePerAsset < assetPorcentageEnMiPorta) {
                const newAmountShares =parseFloat((((percentagePerAsset*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                const newModification = {
                    symbol: asset.symbol,
                    type: "selling",
                    shares: parseFloat((asset.shares - newAmountShares).toFixed(2)),
                    price: assetPrice.price
                };
                modifcations.push(newModification);
                asset.shares = newAmountShares;
                asset.validated = true;
            } else {
                const newModification = {
                    symbol: asset.symbol,
                    type: "nothing",
                    shares: 0,
                    price: assetPrice.price
                };
                modifcations.push(newModification);
                asset.validated = true;
            }
        });

    } else {
        assetsNotChecked.forEach(asset => {
            const assetPrice = totalAmount.portafolio_prices.find(u => u.symbol === asset.symbol);
            const newModification = {
                symbol: asset.symbol,
                type: "selling",
                shares: asset.shares,
                price: assetPrice.price
            };
            modifcations.push(newModification);
            miPortafolio.assets.splice(miPortafolio.assets.indexOf(asset),1);
        });
    }
};

module.exports = { sharesPricesAndAdder, comparativeObjectiveAmount, buyingOrSellingAssets };


