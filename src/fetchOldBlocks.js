const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket');

const handlingDataHelper = require('./helper/handlingDataHelper');
const {generateOldBlockEventQuery} = handlingDataHelper;

const mysqlHelper = require('./helper/mysqlHelper');
const { connect, disconnect, query } = mysqlHelper;

const fs = require('fs');
// connect();
/**
 * Fetch block data from `from` block height to `to` block height
 * @param {*} from block height
 * @param {*} to block height
 */
function fetchData(from, to) {
    for(var i = from ; i <= to ; i++){
        web3.getBlock({height: i}).then((result) => {
            let blockQuery =  generateOldBlockEventQuery(result);
            query(blockQuery)
        })
    }

}
