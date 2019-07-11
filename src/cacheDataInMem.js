require('dotenv').config();
const mysqlHelper = require('./helper/mysqlHelper')
const { query } = mysqlHelper;

const { makeLastBlock, makeListTxQuery, makeListBlockQuery } = require('./helper/handlingDataHelper')

class BlockCache {
    constructor() {
        this.cache = [];
        this.cacheSize = process.env.BLOCK_CACHE_LENGTH;
    }
    async initializeCache() {
        const blocksInCacheQuery = makeListBlockQuery(this.cacheSize, 0);
        const queryResult = await query(blocksInCacheQuery);
        this.setData(queryResult);
    }
    getCacheSize() {
        return this.cacheSize;
    }
    update(newBlock) {
        this.cache.splice(0, 0, newBlock);
        this.cache.length = this.cacheSize;
    }
    isDataOnCache(pageSize, offset) {
        if (offset < this.getCacheSize() && pageSize <= this.getCacheSize()) {
            if (offset + pageSize - 1 < this.getCacheSize()) {
                console.log('cache hit')
                return true;
            }
            console.log('cache miss')
            return false;
            
        }
        console.log('cache miss')
        return false;
    }
    isBlockOnCache(height){
        const max = this.cache[0].height;
        const min = this.cache[99].height;
        if( height >= min && height <= max) {
            console.log('cache hit');
            return true
        } else {
            console.log('cache miss')
            return false;
        }
    }
    setData(data) {
        if (Array.isArray(data)) {
            this.cache = data;
            this.cache.length = this.cacheSize;
        }
    }
    getDataByPageOffset(pageSize, offset) {
        return this.cache.slice(offset, offset + pageSize)
    }
    getDataByHeight(height) {
        if(height) {
            const max = this.cache[0].height;
            return this.cache[max - height ]
        } else {
            return this.cache[0]
        }
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
    async initializeCache() {
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
    getTxByHash(hash){
        function checkHash(tx){
            if(tx.hash === hash) 
                return true;
            return false;
        }
        const tx = this.cache.find(checkHash)
        if(tx) {
            return {
                cacheHit: true,
                data: tx
            }
        }
        return {
            cacheHit: false,
            data: null
        }
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
const updateCache = async () => {
    await updateBlockCache();
    await updateTxCache();
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
