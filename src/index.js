const { totalAmountAdder, comparativeObjectiveAmount, buyingOrSellingAssets } = require('./utils/portafolio.functions');

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
(async ()=> {
    try {    
        console.log(miPortafolio2)
        const totalAmount = await totalAmountAdder(miPortafolio2);
        comparativeObjectiveAmount(portafolioObj2 ,miPortafolio2, totalAmount);
        console.log(miPortafolio2);
        await buyingOrSellingAssets(miPortafolio2,portafolioObj2,totalAmount);
        console.log(miPortafolio2);
    } catch (error) {
        console.log(error);
    }
})();