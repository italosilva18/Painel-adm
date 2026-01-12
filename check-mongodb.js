// Script para verificar o estado do banco de dados MongoDB
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://doadmin:0XZwJ61x9hL354p8@db-mongodb-m2m-565d8767.mongo.ondigitalocean.com/?tls=true&authSource=admin&replicaSet=db-mongodb-m2m';

async function checkDatabase() {
    const client = new MongoClient(uri);

    try {
        console.log('Conectando ao MongoDB...');
        await client.connect();
        console.log('✅ Conectado com sucesso!\n');

        // Verificar banco admin
        const adminDb = client.db('admin');

        // Listar todos os bancos de dados
        console.log('=== BANCOS DE DADOS DISPONÍVEIS ===');
        const dbList = await adminDb.admin().listDatabases();
        dbList.databases.forEach(db => {
            const sizeInMB = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
            console.log(`- ${db.name}: ${sizeInMB} MB`);
        });
        console.log();

        // Verificar banco 'margem' especificamente
        const margemExists = dbList.databases.some(db => db.name === 'margem');

        if (!margemExists) {
            console.log('⚠️ ATENÇÃO: Banco "margem" NÃO ENCONTRADO!');
            console.log('Isso pode indicar que o banco foi deletado ou renomeado.\n');
        } else {
            console.log('✅ Banco "margem" existe!\n');

            // Conectar ao banco margem
            const margemDb = client.db('margem');

            // Listar coleções
            console.log('=== COLEÇÕES NO BANCO "margem" ===');
            const collections = await margemDb.listCollections().toArray();

            if (collections.length === 0) {
                console.log('⚠️ ATENÇÃO: Nenhuma coleção encontrada no banco "margem"!');
            } else {
                // Para cada coleção, contar documentos
                for (const collInfo of collections) {
                    const coll = margemDb.collection(collInfo.name);
                    const count = await coll.countDocuments();
                    const sample = await coll.findOne();
                    const lastModified = sample ? (sample.updatedAt || sample.createdAt || 'N/A') : 'N/A';

                    console.log(`- ${collInfo.name}: ${count} documentos`);
                    if (count > 0 && lastModified !== 'N/A') {
                        console.log(`  Última modificação: ${lastModified}`);
                    }
                }
            }
            console.log();

            // Verificar coleções críticas
            console.log('=== VERIFICAÇÃO DE COLEÇÕES CRÍTICAS ===');
            const criticalCollections = ['users', 'reports', 'scripts', 'licenses', 'companies'];

            for (const collName of criticalCollections) {
                const coll = margemDb.collection(collName);
                const count = await coll.countDocuments();

                if (count === 0) {
                    console.log(`⚠️ Coleção "${collName}": VAZIA ou NÃO EXISTE`);
                } else {
                    console.log(`✅ Coleção "${collName}": ${count} documentos`);

                    // Pegar últimos 3 documentos para verificar atividade recente
                    const recentDocs = await coll.find({})
                        .sort({ _id: -1 })
                        .limit(3)
                        .project({ _id: 1, createdAt: 1, updatedAt: 1 })
                        .toArray();

                    if (recentDocs.length > 0) {
                        console.log(`   Último documento criado: ${recentDocs[0]._id.getTimestamp()}`);
                    }
                }
            }
            console.log();

            // Verificar logs de operação (se disponível)
            console.log('=== ESTATÍSTICAS RECENTES ===');
            const stats = await margemDb.stats();
            console.log(`- Tamanho do banco: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`- Número de coleções: ${stats.collections}`);
            console.log(`- Número de objetos: ${stats.objects}`);
            console.log(`- Tamanho médio de objeto: ${stats.avgObjSize} bytes`);
        }

        // Verificar banco 'mpontom' também (usado pelo consumer)
        const mpontomExists = dbList.databases.some(db => db.name === 'mpontom');
        if (mpontomExists) {
            console.log('\n=== BANCO "mpontom" (Consumer) ===');
            const mpontomDb = client.db('mpontom');
            const collections = await mpontomDb.listCollections().toArray();
            console.log(`Número de coleções: ${collections.length}`);

            for (const collInfo of collections.slice(0, 5)) { // Mostrar apenas 5 primeiras
                const coll = mpontomDb.collection(collInfo.name);
                const count = await coll.countDocuments();
                console.log(`- ${collInfo.name}: ${count} documentos`);
            }
        }

    } catch (error) {
        console.error('❌ Erro ao conectar ou verificar banco:', error.message);
        console.error(error);
    } finally {
        await client.close();
        console.log('\n🔒 Conexão fechada');
    }
}

// Executar verificação
checkDatabase().catch(console.error);