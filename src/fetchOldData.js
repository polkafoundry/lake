const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

const handlingDataHelper = require('./helper/handlingDataHelper')
const { generateOldBlockEventQuery, generateOldTxEventQuery } = handlingDataHelper

const mysqlHelper = require('./helper/mysqlHelper')
const { query } = mysqlHelper

/**
 * Fetch block data from `from` block height to `to` block height
 * @param {*} from block height
 * @param {*} to block height
 */
function fetchOldBlocks (from, to) {
  const promises = []
  for (var i = from; i <= to; i++) {
    const p = web3.getBlock({ height: i }).then((result) => {
      let blockQuery = generateOldBlockEventQuery(result)
      return query(blockQuery)
    })
    promises.push(p)
  }
  return Promise.all(promises)
}

/**
 * Fetch transaction data from `from` block height to `to` block height
 * @param {*} from block height
 * @param {*} to block height
 */
function fetchOldTxs (from, to) {
  const promises = []
  for (let i = from; i <= to; i++) {
    const p = web3.searchTransactions(`tx.height = ${i}`).then((result) => {
      const getTxs = result.txs.reduce((arr, tx) => {
        const decoded = web3.utils.decodeTxResult(tx)
        const mysqlQuery = generateOldTxEventQuery(decoded)
        arr.push(query(mysqlQuery))
        return arr
      }, [])
      return Promise.all(getTxs)
    })
    promises.push(p)
  }
  return Promise.all(promises)
}

module.exports = { fetchOldBlocks, fetchOldTxs }
