require('dotenv').config()
const debug = require('debug')

const { IceteaWeb3 } = require('@iceteachain/web3')
const web3 = new IceteaWeb3('wss://rpc.icetea.io/websocket')

;['Tx', 'NewBlockHeader', 'NewBlock'].forEach(ev => {
    const log = debug('lake:' + ev)
    web3.subscribe(ev,  {}, (e, r) => log(e || r))
})
