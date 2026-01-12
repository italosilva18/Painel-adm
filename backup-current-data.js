// Script para fazer backup dos 6.672 reports atuais ANTES de restaurar
// EXECUTE ISSO ANTES DE RESTAURAR O BACKUP DAS 9H!

const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://doadmin:0XZwJ61x9hL354p8@db-mongodb-m2m-565d8767.mongo.ondigitalocean.com/?tls=true&authSource=admin&replicaSet=db-mongodb-m2m';

async function backupCurrentReports() {
    const client = new MongoClient(uri);

    try {
        console.log('🔵 FAZENDO BACKUP DOS REPORTS ATUAIS (criados após 11:13h)\n');
        console.log('=' .repeat(60) + '\n');

        await client.connect();
        const margemDb = client.db('margem');
        const reportsColl = margemDb.collection('reports');

        // 1. Contar documentos atuais
        const currentCount = await reportsColl.countDocuments();
        console.log(`📊 Total de reports atuais: ${currentCount}\n`);

        // 2. Exportar todos os reports atuais
        console.log('📥 Exportando reports atuais...');
        const currentReports = await reportsColl.find({}).toArray();

        // 3. Salvar em arquivo JSON
        const backupFile = `backup_reports_after_1113_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(currentReports, null, 2));

        console.log(`✅ Backup salvo em: ${backupFile}`);
        console.log(`   Tamanho: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);

        // 4. Verificar range de tempo dos dados salvos
        if (currentReports.length > 0) {
            const firstReport = currentReports[0];
            const lastReport = currentReports[currentReports.length - 1];

            console.log(`\n📅 Range de tempo dos reports salvos:`);
            console.log(`   Primeiro: ${firstReport._id ? new ObjectId(firstReport._id).getTimestamp() : 'N/A'}`);
            console.log(`   Último: ${lastReport._id ? new ObjectId(lastReport._id).getTimestamp() : 'N/A'}`);
        }

        // 5. Salvar também outras coleções importantes
        console.log(`\n📦 Fazendo backup de outras coleções...`);

        const collections = ['stores', 'mobiles', 'goals', 'admins'];
        for (const collName of collections) {
            const coll = margemDb.collection(collName);
            const data = await coll.find({}).toArray();

            if (data.length > 0) {
                const filename = `backup_${collName}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                fs.writeFileSync(filename, JSON.stringify(data, null, 2));
                console.log(`   ✅ ${collName}: ${data.length} documentos salvos em ${filename}`);
            }
        }

        console.log('\n' + '=' .repeat(60));
        console.log('✅ BACKUP COMPLETO DOS DADOS ATUAIS!\n');
        console.log('PRÓXIMOS PASSOS:');
        console.log('1. Agora você pode restaurar o backup das 9h com segurança');
        console.log('2. Após restaurar, use o script restore-missing-reports.js');
        console.log('3. Isso vai adicionar os reports criados após 11:13h de volta');

    } catch (error) {
        console.error('❌ Erro ao fazer backup:', error.message);
    } finally {
        await client.close();
    }
}

const { ObjectId } = require('mongodb');
backupCurrentReports().catch(console.error);