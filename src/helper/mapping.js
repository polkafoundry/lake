const block = {
  'height': '',
  'chain_id': '',
  'hash': '',
  'time': 'new.Date',
  'num_txs': '',
  'total_txs': '',
  'data_hash': '',
  'validators_hash': '',
  'next_validators_hash': '',
  'consensus_hash': '',
  'app_hash': '',
  'last_results_hash': '',
  'evidence_hash': '',
  'proposer_address': '',
  'last_block_id_hash': ''
}

const tx = {
  'height': '',
  'hash': '',
  'index': '',
  'from': '',
  'to': '',
  'payer': '',
  'value': '',
  'gaslimit': '',
  'gasused': '',
  'nonce': '',
  'data_op': '',
  'data_mode': '',
  'data_name': '',
  'data_params': 'JSON.stringify',
  'data_src': 'toString.base64',
  'returnvalue': '',
  'result_code': '',
  'result_data': '',
  'result_log': ''
}

module.exports = { tx, block }
