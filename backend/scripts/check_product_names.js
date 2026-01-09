
const db = require('../config/db');

async function checkProducts() {
    try {
        const [products] = await db.promise().query("SELECT id, name FROM products WHERE category LIKE '%pizza%'");
        console.log('--- PRODUCT NAMES ---');
        products.forEach(p => console.log(`${p.id}: ${p.name}`));
        console.log('---------------------');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkProducts();
