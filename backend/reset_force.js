const db = require('./config/db');

async function reset() {
  console.log("⚡ Démarrage du Hard Reset...");
  try {
    const promiseDb = db.promise();
    
    // 1. On force la fermeture de TOUT ce qui ressemble à un service ouvert
    await promiseDb.query("UPDATE services SET status = 'closed', end_time = NOW() WHERE status = 'open'");
    console.log("✅ Tous les services forcés à CLOSED.");

    // 2. On remet les settings à 'false'
    await promiseDb.query("UPDATE site_settings SET setting_value = 'false' WHERE setting_key = 'shop_open'");
    console.log("✅ Site fermé (Settings mis à jour).");

    console.log("🚀 TERMINÉ. Tu peux redémarrer le serveur et ouvrir un service propre.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err);
    process.exit(1);
  }
}

reset();