require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Map JSON categories to DB ENUM categories
function mapCategory(jsonCategory, description) {
    const desc = description.toLowerCase();

    if (jsonCategory === 'boissons') return 'boissons';
    if (jsonCategory === 'desserts') return 'desserts';

    // Pizzas logic
    if (desc.includes('crème') || desc.includes('creme')) {
        return 'pizzas_blanche';
    }
    return 'pizzas_rouge'; // Default to tomato base
}

async function seedProducts() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create products table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category ENUM('pizzas_rouge', 'pizzas_blanche', 'boissons', 'desserts') NOT NULL,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table products created.');

        // 2. Read products.json
        const dataPath = path.join(__dirname, '../../dolce-pizza-app/src/data/products.json');
        const rawData = fs.readFileSync(dataPath);
        const { products } = JSON.parse(rawData);

        console.log(`Found ${products.length} products to import.`);

        // 3. Insert products
        for (const product of products) {
            const category = mapCategory(product.category, product.description);

            // Check if exists
            const [existing] = await connection.query('SELECT id FROM products WHERE name = ?', [product.name]);

            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
                    [product.name, product.description, product.price, category, product.imageUrl]
                );
                console.log(`Inserted: ${product.name} (${category})`);
            } else {
                console.log(`Skipped (exists): ${product.name}`);
            }
        }

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Error seeding products:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedProducts();
