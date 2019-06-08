const query = require('./sql');
const moment = require('moment');
const fs = require('fs');

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket');

function convertUTCtoTime(timeInUTC) {
    return moment(timeInUTC).format('YYYY-MM-DD hh:mm:ss');
}
function syncNewBlockEventToDatabase() {
    return new Promise((resolve, reject) => {
        web3.subscribe('NewBlock', {}, (err, result) => {
            if (err)  reject(err);
            let block = result.data.value.block;
            let {
                height,
                chain_id,
                num_txs,
                total_txs,
                data_hash,
                validators_hash,
                next_validators_hash,
                consensus_hash,
                app_hash,
                last_results_hash,
                evidence_hash,
                proposer_address
            } = block.header;
            let time = convertUTCtoTime(block.header.time);
            let last_block_id_hash = block.header.last_block_id.hash;
    
            let sql = 'INSERT INTO block (height, num_txs, total_txs, chain_id, time,last_block_id_hash,' +
                'data_hash, validators_hash, next_validators_hash, consensus_hash, app_hash, last_results_hash, evidence_hash, proposer_address)' +
                'VALUES ('
                + height + ','
                + num_txs + ','
                + total_txs + ','
                + '"' + chain_id + '",'
                + '"' + time + '",'
                + '"' + last_block_id_hash + '",'
                + '"' + data_hash + '",'
                + '"' + validators_hash + '",'
                + '"' + next_validators_hash + '",'
                + '"' + consensus_hash + '",'
                + '"' + app_hash + '",'
                + '"' + last_results_hash + '",'
                + '"' + evidence_hash + '",'
                + '"' + proposer_address + '"'
                + ')';
            resolve(sql);
        })

    })
}
function syncTxEventToDatabase() {
    return new Promise((resolve, reject) => {
        web3.subscribe('Tx', {}, (err, result) => {
            if (err) reject( err);
            let hash = result.tags['tx.hash'];
            let {height, index} = result.data.value.TxResult;
            let {from, payer, to, value, fee, data, nonce} = result.data.value.TxResult.tx;
            let {pubkey, signature} = result.data.value.TxResult.tx.evidence[0];
            // let {code, log} = result.data.value.TxResult.result;
            // let result_data = result.data.value.TxResult.result.data;
            
            let sql = 'INSERT INTO transaction (hash, height, tx_index, tx_from, tx_payer, tx_to, tx_value, tx_fee, tx_data, nonce, pubkey, signature) '+  
            // 'code, data, log' +
            'VALUES ('
            + '"' + hash + '",'
            + height + ','
            + index + ','
            + '"' + from + '",'
            + '"' + payer + '",'
            + '"' + to + '",'
            + value + ','
            + fee + ','
            + "'" + data + "',"
            + nonce + ','
            + '"' + pubkey + '",'
            + '"' + signature + '"'
            // + code + ','
            // + '"' + result_data + '",'
            // + '"' + log + '",'
            + ');';
            resolve(sql);
        })
    })
}
async function syncToDatabase(){
    console.log('called')
    let newBlock = await syncNewBlockEventToDatabase();
    let newTx = await syncTxEventToDatabase();
    console.log(newBlock)
    console.log(newTx)
    query(newTx);

}

syncToDatabase()






