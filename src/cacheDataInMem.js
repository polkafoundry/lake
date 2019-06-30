require('dotenv').config();
const txCacheLength = process.env.TX_CACHE_LENGTH;

class BlockCache {
    constructor() {
        this.cache = [];
        this.cacheSize = process.env.BLOCK_CACHE_LENGTH;
    }
    getCacheSize(){
        return this.cacheSize;
    }
    //update cache 
    updateCache(blocks){

    }
    setData(data) {
        if(Array.isArray(data)) {
            this.cache = data;
            this.cache.length = this.cacheSize;
        }
    }
    getData(from, to) {
        return this.cache;
    }
    getHashAndTimeData() {
        return this.cache.map(value => {
            return {
                height: value.height,
                time: value.time
            }
        })
    }


}
let blockCache = new BlockCache();

module.exports = {
    blockCache
}
