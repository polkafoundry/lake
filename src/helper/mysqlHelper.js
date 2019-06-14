const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TPCtpvc1996',
    database: 'lake_db'
});
const connect = () => {
    connection.connect();
    console.log('Connected to MySql Database.')
}
const disconnect = () => {
    connection.end();
}
const query = (sql) => {
    connection.query(sql, (err, result) => {
        if(err) {
            console.log(sql)
            throw err;
        }
        // console.log(result);
    })
}
module.exports = {
    connection,
    connect,
    disconnect,
    query
};