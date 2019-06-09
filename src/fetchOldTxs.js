const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket');

const handlingDataHelper = require('./helper/handlingDataHelper');
const {generateOldTxEventQuery} = handlingDataHelper;

const mysqlHelper = require('./helper/mysqlHelper');
const { connect, disconnect, query } = mysqlHelper;

const fs = require('fs');
connect();
for(var i = 50 ; i < 422 ; i++){
    web3.searchTransactions(`tx.height = ${i}`).then((result) => {
        if(result.txs.length === 0){
            return;
        } 
        result.txs.forEach( tx => {
            let decoded = web3.utils.decodeTxResult(tx)
            let mysqlQuery = generateOldTxEventQuery(decoded);
            query(mysqlQuery)
        });
    
    })
}

