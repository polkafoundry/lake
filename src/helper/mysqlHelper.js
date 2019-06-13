const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
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