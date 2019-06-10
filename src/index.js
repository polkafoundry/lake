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

