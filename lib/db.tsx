import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost', // Оставляем localhost, если Next.js запущен на вашем ПК, а порты Docker проброшены (3306:3306)
    user: 'root', // Или ваш пользователь из docker-compose
    password: 'root_password', // Пароль из вашего docker-compose.yml
    database: 'drevo_db', // Название базы данных
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;