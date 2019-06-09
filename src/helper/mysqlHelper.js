const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lake_db'
});
const connect = () => {
    connection.connect();
}
const disconnect = () => {
    connection.end();
}
const query = (sql) => {
    connection.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
    })
}
module.exports = {
    connect,
    disconnect,
    query
};