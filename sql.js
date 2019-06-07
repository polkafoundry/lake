const mysql = require("mysql");

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lake_db'
});
function query(sqlCommand){
    con.connect((err) => {
        if(err) throw err;
        console.log('connected to mysql server');
        con.query(sqlCommand, (err, result) => {
            if(err) throw err;
            console.log(result);
        })
    })
}
module.exports = query;