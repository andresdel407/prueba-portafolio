const nodeFetch = require('node-fetch');

const APItoken = "Tpk_1badc8b21aef42e39c473a518f595363"

const totalAmountAdder = async(miPortafolio) => {
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
const comparativeObjectiveAmount = (portafolioObj,miPortafolio,totalAmount) => {
    portafolioObj.assets.forEach(asset => {
        const assetEnMiPortafolio = miPortafolio.assets.find( u => u.symbol === asset.symbol);
        if (assetEnMiPortafolio) {
            const assetPrice = totalAmount.portafolio_prices.find(u => u.symbol === assetEnMiPortafolio.symbol);
            const assetPorcentageEnMiPorta = Math.round(((assetPrice.price*assetEnMiPortafolio.shares)*100)/totalAmount.total);
            if (asset.percentage > assetPorcentageEnMiPorta) {
                console.log(`Due to the objective of this asset, we are buying ${asset.symbol} asset`);
                const newAmountShares =parseFloat((((asset.percentage*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                assetEnMiPortafolio.shares = newAmountShares;
                assetEnMiPortafolio.validated = true;
            } else if (asset.percentage < assetPorcentageEnMiPorta) {
                console.log(`Due to the objective of this asset, we are selling ${asset.symbol} asset`);
                const newAmountShares =parseFloat((((asset.percentage*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                assetEnMiPortafolio.shares = newAmountShares;
                assetEnMiPortafolio.validated = true;
            } else {
                console.log("you already satisfy the objectives");
                assetEnMiPortafolio.validated = true;
            }
        } else {
            console.log(`Due to the objective of this asset, we are buying ${asset.symbol} asset`);
            const moneyForAsset = (totalAmount.total*asset.percentage)/100;
            const newAsset = {
                symbol: `${asset.symbol}`,
                money_avaible: moneyForAsset,
                validated: false
            };
            miPortafolio.assets.push(newAsset);
        }
    });
    return miPortafolio
};
const buyingOrSellingAssets = async(miPortafolio, portafolioObj, totalAmount) => {
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
    }));
    if (totalPercentage != 100) {
        const percentagePerAsset = (100 - totalPercentage)/assetsNotChecked.length;
        assetsNotChecked.forEach(asset => {
            const assetPrice = totalAmount.portafolio_prices.find(u => u.symbol === asset.symbol);
            const assetPorcentageEnMiPorta = Math.round(((assetPrice.price*asset.shares)*100)/totalAmount.total);
            if (percentagePerAsset > assetPorcentageEnMiPorta) {
                console.log(`Due to the objective of this asset, we are buying ${asset.symbol} asset`);
                const newAmountShares =parseFloat((((percentagePerAsset*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                asset.shares = newAmountShares;
                asset.validated = true;
            } else if (percentagePerAsset < assetPorcentageEnMiPorta) {
                console.log(`Due to the objective of this asset, we are selling ${asset.symbol} asset`);
                const newAmountShares =parseFloat((((percentagePerAsset*totalAmount.total)/100)/assetPrice.price).toFixed(2));
                asset.shares = newAmountShares;
                asset.validated = true;
            } else {
                console.log("you already satisfy the objectives");
                asset.validated = true;
            }
        });

    } else {
        assetsNotChecked.forEach(asset => {
            miPortafolio.assets.splice(miPortafolio.assets.indexOf(asset),1);
        });
    }
};

module.exports = { totalAmountAdder, comparativeObjectiveAmount, buyingOrSellingAssets };


