const mysql = require('mysql')

const pool = mysql.createPool({
  connectionLimit: 100,
  waitForConnections: true,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  insecureAuth: true // use password for MySql 8.x
})

const query = (...args) => {
  return new Promise((resolve, reject) => {
    pool.query(...args, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

const disconnect = (...args) => pool.end(...args)

module.exports = { query, disconnect }
