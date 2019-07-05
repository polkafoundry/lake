require('dotenv').config();
const mysqlHelper = require('./helper/mysqlHelper')
const { query } = mysqlHelper;

const { makeLastBlock, makeListTxQuery, makeListBlockQuery } = require('./helper/handlingDataHelper')

class BlockCache {
    constructor() {
        this.cache = [];
        this.cacheSize = process.env.BLOCK_CACHE_LENGTH;
    }
    async initializeCache(){
        const blocksInCacheQuery = makeListBlockQuery(this.cacheSize, 0);
        const queryResult = await query(blocksInCacheQuery);
        this.setData(queryResult);
    }
    getCacheSize() {
        return this.cacheSize;
    }
    //update blocks to the head of cache
    update(newBlock) {
        let lastestBlockInCache = this.cache[0];
        // if the lastest block was added more transactions ( not generating a new Block)
        // I haven't tested yet because at the moment: one transaction per block.
        if (newBlock.height === lastestBlockInCache.height) {
            this.cache[0] = newBlock;
        } else {
            this.cache.splice(0, 0, newBlock);
            this.cache.length = this.cacheSize;
        }
    }
    setData(data) {
        if (Array.isArray(data)) {
            this.cache = data;
            this.cache.length = this.cacheSize;
        }
    }
    getData(from, to) {
        return this.cache;
    }
    getHashAndTimeData() {
        console.log(this.cache.map(value => {
            return {
                height: value.height,
                time: value.time
            }
        })
        )
    }
}
class TransactionCache {
    constructor() {
        this.cache = [];
        this.cacheSize = process.env.TX_CACHE_LENGTH;
    }
    async initializeCache(){
        const txsInCacheQuery = makeListTxQuery({}, this.cacheSize, 0)
        const queryResult = await query(txsInCacheQuery);
        this.setData(queryResult);
    }
    getCacheSize() {
        return this.cacheSize;
    }
    //update transactions to the head of cache
    update(newTxs) {
        if (Array.isArray(newTxs)) {
            this.cache = newTxs.concat(this.cache)
            this.cache.length = this.cacheSize;
        }
    }
    setData(data) {
        if (Array.isArray(data)) {
            this.cache = data;
            this.cache.length = this.cacheSize;
        }
    }
    getData(from, to) {
        return this.cache;
    }
    getHashAndTimeData() {
        console.log(this.cache.map(value => {
            return {
                height: value.height,
                index: value.index,
                hash: value.hash,
            }
        })
        )
    }
}
let blockCache = new BlockCache();
let txCache = new TransactionCache();

const updateCache = async () => {
    await updateBlockCache();
    await updateTxCache();
}
const updateBlockCache = async () => {
    let newestBlock = await query(makeLastBlock());
    blockCache.update(newestBlock[0]);
}
const updateTxCache = async () => {
    let newestBlock = await query(makeLastBlock());
    let numTx = newestBlock[0].num_txs;
    const newestTxs = await query(makeListTxQuery({}, numTx, 0));
    txCache.update(newestTxs);

}
const initializeCache = async () => {
    await blockCache.initializeCache();
    await txCache.initializeCache();
}

module.exports = {
    blockCache,
    txCache,
    initializeCache,
    updateCache
}
