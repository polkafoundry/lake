require('dotenv').config()

const debug = require('debug')('lake:new')

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

const mysqlHelper = require('./helper/mysqlHelper')
const { query, disconnect } = mysqlHelper

const { generateNewBlockEventQuery, generateTxEventQuery } = require('./helper/handlingDataHelper')

const close = () => {
  Promise.resolve(web3.close()).finally(() => disconnect(err => {
    console.error(err)

    setTimeout(() => {
      process.exit(1)
    }, 5000)
  }))
}

const shutdown = subs => {
  if (subs) {
    const promises = subs.reduce((list, sub) => {
      list.push(sub.unsubscribe())
      return list
    }, [])
    Promise.all(promises).finally(() => close())
  } else {
    close()
  }
}

(async () => {
  let subs
  try {
    subs = ['NewBlock', 'Tx'].reduce((list, event) => {
      const sub = web3.subscribe(event, {}, (err, result) => {
        if (err) throw err
        switch (event) {
          case 'NewBlock':
            let blockQuery = generateNewBlockEventQuery(result)
            // debug(blockQuery)
            query(blockQuery)
            break
          case 'Tx':
            let txQuery = generateTxEventQuery(result)
            // debug(txQuery)
            query(txQuery)
            break
        }
      })
      list.push(sub)
      return list
    }, [])
  } catch (error) {
    debug(error)
    shutdown(subs)
  }
})()
