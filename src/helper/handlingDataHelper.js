const mapping = require('./mapping')

const flattenObject = function (ob) {
  const toReturn = {}
  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) continue

    if (typeof ob[i] === 'object') {
      const flatObject = flattenObject(ob[i])
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue

        toReturn[i + '_' + x] = flatObject[x]
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}

const filterObject = function (table, ob) {
  const m = mapping[table]
  ob = flattenObject(ob)
  return Object.keys(ob).reduce((o, k) => {
    if (m.hasOwnProperty(k)) {
      let v = ob[k]
      if (v != null && !Number.isNaN(v)) {
        if (m[k] === 'new.Date') {
          v = new Date(ob[k])
        } else if (m[k] === 'JSON.stringify') {
          v = JSON.stringify(ob[k])
        } else if (m[k] === 'toString.base64') {
          v = ob[k].toString('base64')
        }

        o[k] = v
      }
    }
    return o
  }, {})
}

const makeInsertQuery = (table, data) => {
  data = filterObject(table, data)
  const keys = Object.keys(data).map((x) => '`' + x + '`')
  const values = Object.values(data)
  const params = '?' + ',?'.repeat(keys.length - 1)
  const sql = `INSERT IGNORE INTO ${table} (${keys.join(',')}) VALUES (${params})`
  return { sql, values }
}

function generateNewBlockEventQuery(result) {
  return makeInsertQuery('block', result.data.value.header)
}

function generateOldBlockEventQuery(result) {
  const data = result.header
  data.hash = result.block_id.hash
  data.num_txs = result.num_txs
  return makeInsertQuery('block', data)
}

function generateTxQuery(tx) {
  return makeInsertQuery('tx', tx)
}

function generateOldTxEventQuery(r) {
  const { height, index, hash, events } = r
  let { value, fee: gaslimit, nonce } = r.tx
  const t = events.filter((e) => e.eventName === 'tx')

  const from = r.tx.from || t[0].eventData.from
  const to = r.tx.to || t[0].eventData.to
  const payer = r.tx.payer || t[0].eventData.payer
  const gasused = t[0].eventData.gasused

  const data = r.tx.data || {}

  const returnvalue = r.returnValue
  const result = {}
  result.data = r.tx_result.data
  result.code = r.tx_result.code
  result.log = r.tx_result.log

  return generateTxQuery({
    hash,
    height,
    index,
    from,
    to,
    payer,
    value,
    gaslimit,
    gasused,
    nonce,
    data,
    returnvalue,
    result,
  })
}

const makeListBlockQuery = (size, offset) => {
  return `select * from block order by height DESC limit ${size} offset ${offset}`
}

const makeOneBlockQuery = (height) => {
  const sql = 'select * from block where height = ?'
  return { sql, values: [height] }
}

// also mean max height
const makeCountQuery = (table) => {
  return 'select count(*) as count from ' + table
}

const makeLastBlock = (fields) => {
  const fieldText = fields && fields.length ? fields.map((f) => '`' + f + '`').join(',') : '*'
  return 'select ' + fieldText + ' from block order by height DESC limit 1'
}

const makeLastTx = (fields) => {
  const fieldText = fields && fields.length ? fields.map((f) => 'tx.`' + f + '`').join(',') : '*'
  return (
    'select ' + fieldText + ',block.`time` from tx join block on tx.height = block.height order by tx.height DESC, tx.`index` DESC limit 1'
  )
}

const makeListTxQuery = (filter, size, offset) => {
  const fields = { ...mapping.tx }
  delete fields.data_src
  delete fields.result_data
  const fieldText = Object.keys(fields)
    .map((x) => 'tx.`' + x + '`')
    .join(',')
  let sql = 'select ' + fieldText + ' ,block.`time` from tx join block on tx.height = block.height'
  const keys = Object.keys(filter)
  const values = []
  if (keys.length) {
    sql += ' where '
    const where = []
    keys.forEach((k) => {
      where.push(`tx.\`${k}\` = ?`)
      values.push(filter[k])
    })

    sql += where.join(' and ')
  }
  sql += ` order by tx.height DESC, tx.\`index\` DESC limit ${size} offset ${offset}`
  return { sql, values }
}

const makeOneTxQuery = (hash) => {
  const sql = 'select tx.*, block.`time` from tx join block on tx.height = block.height where tx.hash = ?'
  return { sql, values: [hash] }
}

module.exports = {
  generateNewBlockEventQuery,
  generateOldTxEventQuery,
  generateOldBlockEventQuery,
  makeListBlockQuery,
  makeOneBlockQuery,
  makeCountQuery,
  makeLastBlock,
  makeLastTx,
  makeListTxQuery,
  makeOneTxQuery,
}
