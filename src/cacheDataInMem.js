require('dotenv').config();
const mysqlHelper = require('./helper/mysqlHelper')
const { query } = mysqlHelper;

const { makeLastBlock, makeLastTx, makeListBlockQuery } = require('./helper/handlingDataHelper')

const txCacheLength = process.env.TX_CACHE_LENGTH;

class BlockCache {
    constructor() {
        this.cache = [];
        this.cacheSize = process.env.BLOCK_CACHE_LENGTH;
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
let blockCache = new BlockCache();

const updateCache = async (height) => {
    let newestBlock = await query(makeLastBlock());
    blockCache.update(newestBlock[0]);
    blockCache.getHashAndTimeData()
}

const initializeCache = async () => {
    const blocksInCacheQuery = makeListBlockQuery(process.env.BLOCK_CACHE_LENGTH, 0);
    const queryResult = await query(blocksInCacheQuery);
    blockCache.setData(queryResult);
}

module.exports = {
    blockCache,
    initializeCache,
    updateCache
}
