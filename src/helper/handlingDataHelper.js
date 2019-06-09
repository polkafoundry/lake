const moment = require('moment');

function convertUTCtoTime(timeInUTC) {
    return moment(timeInUTC).format('YYYY-MM-DD hh:mm:ss');
}
function generateBlockQuery(
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
    proposer_address,
    time,
    last_block_id_hash) {
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
    return sql;
}
function generateNewBlockEventQuery(result) {
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
    return generateBlockQuery( 
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
        proposer_address,
        time,
        last_block_id_hash)
}
function generateOldBlockEventQuery(result) {
    let block = result.block;
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
    return generateBlockQuery( 
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
        proposer_address,
        time,
        last_block_id_hash)
}
function generateTxQuery(hash, height, index, from, payer, to, value, fee, data, nonce, pubkey, signature) {
    let sql = 'INSERT INTO transaction (hash, height, tx_index, tx_from, tx_payer, tx_to, tx_value, tx_fee, tx_data, nonce, pubkey, signature) ' +
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
    return sql;
}
function generateTxEventQuery(result) {
    let hash = result.tags['tx.hash'];
    let { height, index } = result.data.value.TxResult;
    let { from, payer, to, value, fee, data, nonce } = result.data.value.TxResult.tx;
    let { pubkey, signature } = result.data.value.TxResult.tx.evidence[0];
    // let {code, log} = result.data.value.TxResult.result;
    // let result_data = result.data.value.TxResult.result.data;
    return generateTxQuery(hash, height, index, from, payer, to, value, fee, data, nonce, pubkey, signature);
}

function generateOldTxEventQuery(result) {
    let { height, index, hash } = result;
    let { from, payer, to, value, fee, data, nonce } = result.tx;
    let { pubkey, signature } = result.tx.evidence[0];

    return generateTxQuery(hash, height, index, from, payer, to, value, fee, data, nonce, pubkey, signature);
}

module.exports = {
    generateNewBlockEventQuery,
    generateTxEventQuery,
    generateOldTxEventQuery,
    generateOldBlockEventQuery
}