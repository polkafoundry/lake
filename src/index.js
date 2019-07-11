require('dotenv').config()
const debug = require('debug')('lake:web')
const fastify = require('fastify')({ logger: true })

const { query, disconnect } = require('./helper/mysqlHelper')
const factory = require('./helper/handlingDataHelper')

const { blockCache, txCache } = require('./cacheDataInMem')

const fetch = require('./fetch')
// Declare a route
fastify.get('/block/list', async (request, reply) => {
  let pageSize = parseInt(request.query.page_size)
  if (!pageSize || pageSize <= 0 || pageSize > 100) {
    pageSize = 15
  }
  let pageIndex = parseInt(request.query.page_index)
  if (!pageIndex || pageIndex <= 0) {
    pageIndex = 1
  }
  const offset = (pageIndex - 1) * pageSize
  const isCacheHit = blockCache.isDataOnCache(pageSize, offset);
  if(isCacheHit) {
    return blockCache.getDataByPageOffset(pageSize, offset)
  }
  return query(factory.makeListBlockQuery(pageSize, offset))
})

fastify.get('/block/count', async (request, reply) => {
  return query(factory.makeCountQuery('block'))
})

fastify.get('/block/:height', async (request, reply) => {
  const height = request.params.height;
  const isCacheHit = blockCache.isBlockOnCache(height);
  if(isCacheHit) {
    return blockCache.getDataByHeight(height)
  }
  return query(factory.makeOneBlockQuery(height))
})

fastify.get('/block/lastest', async (request, reply) => {
  return blockCache.getDataByHeight()
})

fastify.get('/tx/list', async (request, reply) => {
  let pageSize = parseInt(request.query.page_size)
  if (!pageSize || pageSize <= 0 || pageSize > 100) {
    pageSize = 15
  }
  let pageIndex = parseInt(request.query.page_index)
  if (!pageIndex || pageIndex <= 0) {
    pageIndex = 1
  }

  const offset = (pageIndex - 1) * pageSize
  const filter = {}
  if (request.query.hash) {
    filter.hash = request.query.hash
  }
  if (request.query.height) {
    filter.height = request.query.height
  }
  if (request.query.from) {
    filter.from = request.query.from
  }
  if (request.query.to) {
    filter.to = request.query.to
  }
  const {cacheHit, data} = txCache.getTx(filter, pageSize, offset)
  if(cacheHit) {
    return data
  }
  return query(factory.makeListTxQuery(filter, pageSize, offset))
})

fastify.get('/tx/count', async (request, reply) => {
  return query(factory.makeCountQuery('tx'))
})

fastify.get('/tx/:hash', async (request, reply) => {
  const hash = request.params.hash;
  const {cacheHit, data} = txCache.getTxByHash(hash);
  if(cacheHit){
    console.log('cache hit')
    return data;
  }
  console.log('cache miss')
  return query(factory.makeOneTxQuery(hash))
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    fetch()
  } catch (err) {
    fastify.log.error(err)
    disconnect(err => {
      debug(err)
      process.exit(1)
    })
  }
}
start()
