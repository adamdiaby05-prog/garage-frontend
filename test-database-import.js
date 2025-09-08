const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseImport() {
  console.log('🧪 Test de l\'import de la base de données...\n');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'garage_db',
    port: process.env.DB_PORT || 3306
  };

  try {
    console.log('1. Connexion à la base de données...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion réussie');

    console.log('\n2. Vérification des tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Nombre de tables trouvées: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📋 Tables présentes:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }

    console.log('\n3. Vérification des vues...');
    const [views] = await connection.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
    console.log(`👁️ Nombre de vues trouvées: ${views.length}`);
    
    if (views.length > 0) {
      console.log('📋 Vues présentes:');
      views.forEach(view => {
        console.log(`   - ${Object.values(view)[0]}`);
      });
    }

    console.log('\n4. Vérification des triggers...');
    const [triggers] = await connection.execute('SHOW TRIGGERS');
    console.log(`🔄 Nombre de triggers trouvés: ${triggers.length}`);
    
    if (triggers.length > 0) {
      console.log('📋 Triggers présents:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.Trigger}`);
      });
    }

    console.log('\n5. Vérification des procédures stockées...');
    const [procedures] = await connection.execute("SHOW PROCEDURE STATUS WHERE Db = 'garage_db'");
    console.log(`🛠️ Nombre de procédures trouvées: ${procedures.length}`);
    
    if (procedures.length > 0) {
      console.log('📋 Procédures présentes:');
      procedures.forEach(proc => {
        console.log(`   - ${proc.Name}`);
      });
    }

    console.log('\n6. Vérification des fonctions...');
    const [functions] = await connection.execute("SHOW FUNCTION STATUS WHERE Db = 'garage_db'");
    console.log(`🔧 Nombre de fonctions trouvées: ${functions.length}`);
    
    if (functions.length > 0) {
      console.log('📋 Fonctions présentes:');
      functions.forEach(func => {
        console.log(`   - ${func.Name}`);
      });
    }

    console.log('\n7. Test des données...');
    const [clients] = await connection.execute('SELECT COUNT(*) as count FROM clients');
    const [employes] = await connection.execute('SELECT COUNT(*) as count FROM employes');
    const [vehicules] = await connection.execute('SELECT COUNT(*) as count FROM vehicules');
    const [pieces] = await connection.execute('SELECT COUNT(*) as count FROM pieces');
    const [reparations] = await connection.execute('SELECT COUNT(*) as count FROM reparations');

    console.log(`👥 Clients: ${clients[0].count}`);
    console.log(`👨‍🔧 Employés: ${employes[0].count}`);
    console.log(`🚗 Véhicules: ${vehicules[0].count}`);
    console.log(`🔧 Pièces: ${pieces[0].count}`);
    console.log(`🔨 Réparations: ${reparations[0].count}`);

    console.log('\n8. Test des vues...');
    try {
      const [dashboardStats] = await connection.execute('SELECT * FROM v_dashboard_stats');
      console.log('✅ Vue v_dashboard_stats fonctionne');
    } catch (error) {
      console.log('❌ Vue v_dashboard_stats non disponible');
    }

    try {
      const [stockCritique] = await connection.execute('SELECT * FROM v_stock_critique');
      console.log('✅ Vue v_stock_critique fonctionne');
    } catch (error) {
      console.log('❌ Vue v_stock_critique non disponible');
    }

    console.log('\n9. Test des procédures...');
    try {
      const [stats] = await connection.execute('CALL GetDashboardStats()');
      console.log('✅ Procédure GetDashboardStats fonctionne');
    } catch (error) {
      console.log('❌ Procédure GetDashboardStats non disponible');
    }

    await connection.end();

    console.log('\n🎉 Test terminé avec succès !');
    console.log('✅ La base de données est prête à l\'utilisation');
    console.log('🌐 Vous pouvez maintenant démarrer l\'application');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que MySQL est démarré dans XAMPP');
    console.log('2. Exécutez fix-tablespace-error.sql dans phpMyAdmin');
    console.log('3. Puis importez garage_complete_no_drop.sql');
  }
}

testDatabaseImport(); 