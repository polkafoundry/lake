require('dotenv').config()

const debug = require('debug')('lake:fetch')

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

const mysqlHelper = require('./helper/mysqlHelper')
const { query, disconnect } = mysqlHelper

const { fetchOldBlocks, fetchOldTxs } = require('./fetchOldData')

const { makeLastBlock, makeLastTx, makeListBlockQuery } = require('./helper/handlingDataHelper')

const { updateCache, initializeCache } = require('./cacheDataInMem');



const close = (code = 1) => {
  const unsub = global._sub ? global._sub.unsubscribe() : Promise.resolve(undefined)
  unsub.finally(() => {
    web3.close().finally(() => disconnect(err => {
      console.error(err)

      // for some reason, it does not exit
      setTimeout(() => {
        process.exit(code)
      }, 5000)
    }))
  })
}

const handleError = error => {
  debug(error)
  close()
}

const fetchData = async (fromBlockHeight, fromTxHeight, toHeight) => {
  try {

    await fetchOldBlocks(fromBlockHeight, toHeight)
    await fetchOldTxs(fromTxHeight, toHeight)

  } catch (error) {
    handleError(error)
  } 
}

const fetchAtInterval = async () => {
  try {

    // get last fetch block
    const lastFetchedBlock = await query(makeLastBlock(['height']))
    const fromBlockHeight = lastFetchedBlock.length ? (lastFetchedBlock[0].height || 0) + 1 : 1

    const lastFetchedTx = await query(makeLastTx(['height']))
    const fromTxHeight = lastFetchedTx.length ? (lastFetchedTx[0].height || 0) + 1 : 1

    // Get latest block
    const latestBlock = await web3.getBlocks({ minHeight: 1, maxHeight: 1 })
    //debug(latestBlock)
    latestHeight = latestBlock.last_height

    await fetchData(fromBlockHeight, fromTxHeight, latestHeight)

    // safe guard in case the event does not work somehow....
    setTimeout(fetchAtInterval, 60000)

  } catch (error) {
    handleError(error)
  }
}

const watchNewBlock = async () => {
  global._sub = web3.subscribe('NewBlockHeader', async (error, result) => {
    if (error) {
      handleError(error)
      return
    }

    const height = result.data.value.header.height
    await fetchData(height - 1, height - 1, height)
    await updateCache()
  })
}
const start = async () => {
  await fetchAtInterval()
  await initializeCache()
  watchNewBlock()

  // exit in case the websocket is lost (e.g. rpc restarts), so pm2 can restart things
  web3.onError(handleError)
}

start()
