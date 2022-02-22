/**
 * Se requieren las funciones definidas en utils
 */
const { sharesPricesAndAdder, comparativeObjectiveAmount, buyingOrSellingAssets } = require('./utils/portafolio.functions');
/**
 * Definición de portafolio escenario 1 
 * @type {{name: string, targetPortafolio: number, assets: Array<number|string> }}
 */
const miPortafolio1 = {
    name: "mis inversiones",
    targetPortfolio: 6,
    assets:[
        {
            shares: 3,
            symbol: "AAPL"
        },
        {
            shares: 4,
            symbol: "GOOGL"
        }
    ]
};
/**
 * Definición de portafolio objetivo escenario 1 
 * @type {{name: string, assets: Array<number|string> }}
 */
const portafolioObj1 ={
    name: "targetPortfolio6",
    assets: [
        {
            percentage: 10,
            symbol: "AAPL"
        },
        {
            percentage: 90,
            symbol: "GOOGL"
        }
    ]
};
/**
 * Definición de portafolio escenario 2
 * @type {{name: string, targetPortafolio: number, assets: Array<number|string> }}
 */
const miPortafolio2 = {
    name: "mis inversiones",
    targetPortfolio: 10,
    assets:[
        {
            shares: 5,
            symbol: "ABNB"
        },
        {
            shares: 8,
            symbol: "FB"
        }
    ]
};
/**
 * Definición de portafolio objetivo esenario 2
 * @type {{name: string, assets: Array<number|string> }}
 */
const portafolioObj2 ={
    name: "targetPortfolio10",
    assets: [
        {
            percentage: 30,
            symbol: "AAPL"
        },
        {
            percentage: 30,
            symbol: "GOOGL"
        },
        {
            percentage: 10,
            symbol: "FB"
        }
    ]
};


/**
 * Ejecución del código
 */
(async ()=> {
    try {
        console.log("Portafolio Incial");   
        console.log(miPortafolio1);
        const totalAmount = await sharesPricesAndAdder(miPortafolio1);
        const modifications = comparativeObjectiveAmount(portafolioObj1 ,miPortafolio1, totalAmount);
        await buyingOrSellingAssets(miPortafolio1,portafolioObj1,totalAmount, modifications);
        console.log("Portafolio Final");
        console.log(miPortafolio1);
        console.log("Modificaciones");
        console.log(modifications)
    } catch (error) {
        console.log(error);
    }
})();
