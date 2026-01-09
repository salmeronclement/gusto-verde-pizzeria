const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const schemaPath = path.join(__dirname, '../sql/2025-12-add-drivers-and-deliveries.sql');

fs.readFile(schemaPath, 'utf8', (err, sql) => {
    if (err) {
        console.error('❌ Erreur de lecture du fichier SQL :', err);
        process.exit(1);
    }

    const queries = sql
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

    console.log(`🚀 Exécution de ${queries.length} requêtes SQL pour les livreurs...`);

    function executeQuery(index) {
        if (index >= queries.length) {
            seedDrivers();
            return;
        }

        const query = queries[index];
        db.query(query, (err, result) => {
            if (err) {
                console.error(`❌ Erreur lors de l'exécution de la requête #${index + 1} :`, err.message);
                process.exit(1);
            } else {
                executeQuery(index + 1);
            }
        });
    }

    function seedDrivers() {
        // Check if drivers exist
        db.query('SELECT COUNT(*) as count FROM drivers', (err, results) => {
            if (err) {
                console.error('❌ Erreur vérification drivers :', err);
                process.exit(1);
            }

            if (results[0].count === 0) {
                console.log('🌱 Insertion de livreurs de test...');
                const drivers = [
                    ['Clément', 'Salmeron', '0612345678', 'scooter'],
                    ['Jean', 'Dupont', '0698765432', 'vélo'],
                    ['Marie', 'Curie', '0655443322', 'voiture']
                ];

                const sql = 'INSERT INTO drivers (first_name, last_name, phone, vehicle_type) VALUES ?';
                db.query(sql, [drivers], (err, result) => {
                    if (err) {
                        console.error('❌ Erreur insertion drivers :', err);
                    } else {
                        console.log(`✅ ${result.affectedRows} livreurs insérés.`);
                    }
                    console.log('✅ Initialisation terminée.');
                    process.exit(0);
                });
            } else {
                console.log('ℹ️ Des livreurs existent déjà, pas de seed.');
                console.log('✅ Initialisation terminée.');
                process.exit(0);
            }
        });
    }

    executeQuery(0);
});
