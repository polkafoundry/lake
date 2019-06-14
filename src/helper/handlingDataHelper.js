const mapping = require('./mapping')

const flattenObject = function (ob) {
    const toReturn = {}
    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue

        if ((typeof ob[i]) === 'object') {
            const flatObject = flattenObject(ob[i])
            for (let x in flatObject) {
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
    const keys = Object.keys(data).map(x => '`' + x + '`')
    const values = Object.values(data)
    const params = '?' + ',?'.repeat(keys.length - 1)
    const sql = `INSERT IGNORE INTO ${table} (${keys.join(',')}) VALUES (${params})`
    return { sql, values }
}

function generateNewBlockEventQuery(result) {
    return makeInsertQuery('block', result.data.value.block.header)
}

function generateOldBlockEventQuery(result) {
    return makeInsertQuery('block', result.block.header)
}

function generateTxQuery(tx) {
    return makeInsertQuery('tx', tx)
}
function generateTxEventQuery(r) {
    const hash = r.tags['tx.hash']
    const txResult = r.data.value.TxResult
    const { height, index } = txResult
    let { value, fee: gaslimit, nonce } = txResult.tx

    const from = txResult.tx.from || r.tags['tx.from']
    const to = txResult.tx.to || r.tags['tx.to']
    const payer = txResult.tx.payer || r.tags['tx.payer']
    const gasused = r.tags['gasused']

    const data = JSON.parse(txResult.tx.data) || {}

    const returnvalue = txResult.returnValue
    const result = {}
    result.data = txResult.result.data
    result.code = txResult.result.code
    result.log = txResult.result.log

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
        result
    })
}

function generateOldTxEventQuery(r) {
    const { height, index, hash } = r
    let { value, fee: gaslimit, nonce } = r.tx

    const from = r.tx.from || r.tags['tx.from']
    const to = r.tx.to || r.tags['tx.to']
    const payer = r.tx.payer || r.tags['tx.payer']
    const gasused = r.tags['gasused']

    const data = JSON.parse(r.tx.data) || {}

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
        result
    })
}

const makeListBlockQuery = (size, offset) => {
    return `select * from block order by height DESC limit ${size} offset ${offset}`
}

const makeOneBlockQuery = height => {
    const sql = 'select * from block where height = ?'
    return { sql, values: [height] }
}

// also mean max height
const makeCountQuery = table => {
    return 'select count(*) as count from ' + table
}

const makeLastBlock = () => {
    return 'select * from block order by height DESC limit 1'
}

const makeListTxQuery = (filter, size, offset) => {
    const fields = { ...(mapping.tx) }
    delete fields.data_src
    delete fields.result_data
    const fieldText = Object.keys(fields).map(x => '`' + x + '`').join(',')
    let sql = 'select ' + fieldText + ' from tx'
    const keys = Object.keys(filter)
    const values = []
    if (keys.length) {
        sql += ' where '
        const where = []
        keys.forEach(k => {
            where.push(`${k} = ?`)
            values.push(filter[k])
        })

        sql += where.join(' and ')
    }
    sql += ` order by height DESC, \`index\` DESC limit ${size} offset ${offset}`
    return { sql, values }
}

const makeOneTxQuery = hash => {
    const sql = 'select * from tx where hash = ?'
    return { sql, values: [hash] }
}

module.exports = {
    generateNewBlockEventQuery,
    generateTxEventQuery,
    generateOldTxEventQuery,
    generateOldBlockEventQuery,
    makeListBlockQuery,
    makeOneBlockQuery,
    makeCountQuery,
    makeLastBlock,
    makeListTxQuery,
    makeOneTxQuery
}
