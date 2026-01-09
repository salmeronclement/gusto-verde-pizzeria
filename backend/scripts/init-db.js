const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const schemaPath = path.join(__dirname, '../sql/schema_orders.sql');

fs.readFile(schemaPath, 'utf8', (err, sql) => {
    if (err) {
        console.error('❌ Erreur de lecture du fichier SQL :', err);
        process.exit(1);
    }

    // Split queries by semicolon to execute them one by one
    // Note: This is a simple split and might break if semicolons are inside strings, 
    // but for this specific schema it's safe.
    const queries = sql
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

    let completed = 0;
    let errors = 0;

    console.log(`🚀 Exécution de ${queries.length} requêtes SQL...`);

    // We execute sequentially to ensure foreign keys are respected (though tables creation order handles it)
    // But async/await with mysql2 callback API is tricky without promise wrapper.
    // We'll use a simple recursive function or just fire them. 
    // Since table creation order matters (customers -> addresses -> orders -> items), 
    // we MUST ensure sequential execution or rely on the fact that we use CREATE TABLE IF NOT EXISTS
    // and the order in the file is correct.

    // To be safe and simple with the callback API, let's wrap in a helper function

    function executeQuery(index) {
        if (index >= queries.length) {
            console.log('✅ Schéma commandes créé/mis à jour avec succès.');
            process.exit(0);
            return;
        }

        const query = queries[index];
        db.query(query, (err, result) => {
            if (err) {
                console.error(`❌ Erreur lors de l'exécution de la requête #${index + 1} :`, err.message);
                console.error('Requête :', query);
                process.exit(1);
            } else {
                executeQuery(index + 1);
            }
        });
    }

    executeQuery(0);
});
