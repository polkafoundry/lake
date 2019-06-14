CREATE DATABASE icetea_lake;

CREATE TABLE IF NOT EXISTS `block` (
  `height` int(11) NOT NULL,
  `chain_id` varchar(255) DEFAULT NULL,
  `time` datetime NOT NULL,
  `num_txs` int(11) NOT NULL,
  `total_txs` int(11) NOT NULL,
  `data_hash` varchar(255) NOT NULL,
  `validators_hash` varchar(255) NOT NULL,
  `next_validators_hash` varchar(255) NOT NULL,
  `consensus_hash` varchar(255) NOT NULL,
  `app_hash` varchar(255) NOT NULL,
  `last_results_hash` varchar(255) NOT NULL,
  `evidence_hash` varchar(255) NOT NULL,
  `proposer_address` varchar(255) NOT NULL,
  `last_block_id_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`height`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `tx` (
  `height` int(11) NOT NULL,
  `hash` varchar(255) NOT NULL,
  `index` int(11) DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  `payer` varchar(255) DEFAULT NULL,
  `value` int(11) DEFAULT 0,
  `gaslimit` int(11) DEFAULT 0,
  `gasused` int(11) DEFAULT 0,
  `nonce` double DEFAULT NULL,
  `data_op` int(3) DEFAULT NULL,
  `data_mode` int(5) DEFAULT 0,
  `data_name` varchar(255) DEFAULT NULL,
  `data_params` varchar(1028) NULL,
  `data_src` longtext DEFAULT NULL,
  `returnvalue` varchar(1018) DEFAULT NULL,
  `result_code` int(11) DEFAULT 0,
  `result_data` varchar(1028) DEFAULT NULL,
  `result_log` varchar(1028) DEFAULT NULL,
  PRIMARY KEY (`hash`)
) ENGINE=InnoDB;