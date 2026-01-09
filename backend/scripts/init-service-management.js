require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

async function initServiceManagement() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create services table
        const createServicesTable = `
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                start_time DATETIME NOT NULL,
                end_time DATETIME,
                status ENUM('open', 'closed') DEFAULT 'open',
                total_revenue DECIMAL(10, 2) DEFAULT 0,
                order_count INT DEFAULT 0,
                average_ticket DECIMAL(10, 2) DEFAULT 0,
                top_item VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await connection.query(createServicesTable);
        console.log('Table "services" created or already exists.');

        // 2. Add service_id to orders table
        // Check if column exists first to avoid error
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'service_id'
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            await connection.query(`
                ALTER TABLE orders 
                ADD COLUMN service_id INT NULL,
                ADD CONSTRAINT fk_orders_service 
                FOREIGN KEY (service_id) REFERENCES services(id) 
                ON DELETE SET NULL
            `);
            console.log('Column "service_id" added to "orders" table.');
        } else {
            console.log('Column "service_id" already exists in "orders" table.');
        }

        console.log('Service Management DB initialization completed successfully.');

    } catch (error) {
        console.error('Error initializing Service Management DB:', error);
    } finally {
        if (connection) await connection.end();
    }
}

initServiceManagement();
