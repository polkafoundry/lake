require('dotenv').config()

const debug = require('debug')('lake:old')

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

const mysqlHelper = require('./helper/mysqlHelper')
const { disconnect } = mysqlHelper

const { fetchOldBlocks, fetchOldTxs } = require('./fetchOldData')

const close = () => {
  Promise.resolve(web3.close()).finally(() => disconnect(err => {
    console.error(err)

    // for some reason, it does not exit
    setTimeout(() => {
      process.exit(0)
    }, 2000)
  }))
}

(async () => {
  try {
    // Get latest block
    const latestBlock = await web3.getBlock()
    // debug(latestBlock)
    const latestHeight = latestBlock.block_meta.header.height
    // debug(latestHeight)

    await fetchOldBlocks(1, latestHeight)
    await fetchOldTxs(1, latestHeight)
    await close()
  } catch (error) {
    debug(error)
    await close()
  }
})()
