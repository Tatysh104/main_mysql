const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // если вы не устанавливали пароль, оставьте пустым
    database: 'ChatBotTests'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database!');
});