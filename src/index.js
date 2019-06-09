const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket');

const mysqlHelper = require('./helper/mysqlHelper');
const { connect, disconnect, query } = mysqlHelper;

const handlingDataHelper = require('./helper/handlingDataHelper');
const { generateNewBlockEventQuery, generateTxEventQuery } = handlingDataHelper;

const fs = require('fs');
connect();

['NewBlock', 'Tx'].forEach((event) => {
    web3.subscribe(event, {}, (err, result) => {
        if (err) throw err;
        switch (event) {
            case 'NewBlock':
                let blockQuery = generateNewBlockEventQuery(result);
                query(blockQuery);
                break;
            case 'Tx':
                let txQuery = generateTxEventQuery(result);
                query(txQuery);
                break;
        }
    })
})

/**
 *
 * `Temporary approach:` keep connection with mysql `ON`
 */
// disconnect();


// web3.searchTransactions("tx.height = 1").then((result) => {
//     fs.writeFileSync('/Users/duongtung/Workspace/tradaTech/lake/localStorage/txs.json', JSON.stringify(result))
//     console.log(result)
// })
// web3.getTransaction('C69BA32FFDAFA2F176C4464F445B3500E26EEBCCE9424341D1DA85C0C78A49E8').then((result) => {
//     // console.log( generateTxEventQuery(result)))
//     fs.writeFileSync('/Users/duongtung/Workspace/tradaTech/lake/localStorage/errorTx1.json', JSON.stringify(result))
// })
// let json = require('../localStorage/tx.json')

// let txQuery = generateTxEventQuery(json);
//                 query(txQuery);

