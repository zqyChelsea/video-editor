const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config.js');
const pool = require('./database');

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL连接成功！');
        
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('数据库中的表:', rows);
        
        connection.release();
        console.log('连接已释放');
    } catch (error) {
        console.error('MySQL连接错误:', error.message);
    }
}

testConnection();