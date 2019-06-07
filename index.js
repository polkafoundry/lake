const query = require('./sql');
const moment = require('moment');
const fs = require('fs');

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket');

function convertUTCtoTime(timeInUTC) {
    return moment(timeInUTC).format('YYYY-MM-DD hh:mm:ss');
}
function syncNewBlockEventToDatabase() {
    web3.subscribe('NewBlock', {}, (err, result) => {
        if (err) throw err;
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
        query(sql);
    })
}
function syncTxEventToDatabase() {
    web3.subscribe('Tx', {}, (err, result) => {
        if (err) throw err;

        fs.writeFileSync('./localStorage/tx.json', JSON.stringify(result))
    })
}
syncNewBlockEventToDatabase();
syncTxEventToDatabase();






