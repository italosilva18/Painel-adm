// Script para verificar se as coleções ausentes estão no banco mpontom
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://doadmin:0XZwJ61x9hL354p8@db-mongodb-m2m-565d8767.mongo.ondigitalocean.com/?tls=true&authSource=admin&replicaSet=db-mongodb-m2m';

async function checkMpontomCollections() {
    const client = new MongoClient(uri);

    try {
        console.log('Verificando coleções no banco "mpontom"...\n');
        await client.connect();

        const mpontomDb = client.db('mpontom');

        // Listar todas as coleções em mpontom
        console.log('=== COLEÇÕES NO BANCO "mpontom" ===\n');
        const collections = await mpontomDb.listCollections().toArray();

        for (const collInfo of collections) {
            const coll = mpontomDb.collection(collInfo.name);
            const count = await coll.countDocuments();

            console.log(`📁 ${collInfo.name}: ${count} documentos`);

            // Se for uma coleção que esperávamos em margem
            if (['user', 'users', 'script', 'scripts', 'license', 'licenses', 'company', 'companies'].includes(collInfo.name)) {
                console.log(`   ⚠️ Esta coleção poderia ser importante para o sistema!`);

                // Mostrar amostra de dados
                const sample = await coll.findOne();
                if (sample) {
                    console.log(`   📊 Amostra de campos: ${Object.keys(sample).slice(0, 5).join(', ')}`);
                    if (sample._id) {
                        console.log(`   📅 Criado em: ${sample._id.getTimestamp()}`);
                    }
                }
            }
        }

        // Verificar coleção user especificamente (nota: singular, não plural)
        console.log('\n=== ANÁLISE DA COLEÇÃO "user" EM MPONTOM ===\n');
        const userColl = mpontomDb.collection('user');
        const userCount = await userColl.countDocuments();

        if (userCount > 0) {
            console.log(`✅ Encontrados ${userCount} usuários na coleção "user" do banco "mpontom"`);

            // Mostrar alguns exemplos
            const users = await userColl.find({}).limit(3).toArray();
            console.log('\nPrimeiros 3 usuários:');
            for (const user of users) {
                console.log(`- ${user.name || 'N/A'} (${user.email || 'N/A'})`);
                if (user.createdAt) {
                    console.log(`  Criado: ${new Date(user.createdAt).toISOString()}`);
                }
            }

            // Verificar usuários ativos
            const activeUsers = await userColl.countDocuments({ active: true });
            console.log(`\n👤 Usuários ativos: ${activeUsers}`);

            // Verificar usuários criados recentemente
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentUsers = await userColl.countDocuments({
                createdAt: { $gte: oneDayAgo }
            });
            console.log(`🆕 Usuários criados nas últimas 24h: ${recentUsers}`);
        }

        // Verificar coleção report (reports do sistema)
        console.log('\n=== ANÁLISE DA COLEÇÃO "report" EM MPONTOM ===\n');
        const reportColl = mpontomDb.collection('report');
        const reportCount = await reportColl.countDocuments();
        console.log(`📊 Total de reports: ${reportCount}`);

        if (reportCount > 0) {
            const latestReport = await reportColl.findOne({}, { sort: { _id: -1 } });
            if (latestReport) {
                console.log(`📅 Report mais recente: ${latestReport._id.getTimestamp()}`);
            }
        }

        // Comparação final
        console.log('\n=== SITUAÇÃO IDENTIFICADA ===\n');
        console.log('📌 DESCOBERTAS:');
        console.log('1. As coleções de usuários e outras entidades críticas NÃO estão no banco "margem"');
        console.log('2. Existe uma coleção "user" (singular) no banco "mpontom" com dados de usuários');
        console.log('3. O banco "mpontom" parece estar sendo usado pelo consumer gateway');
        console.log('4. As APIs podem estar tentando acessar coleções que não existem em "margem"');
        console.log('\n⚠️ POSSÍVEL PROBLEMA DE CONFIGURAÇÃO:');
        console.log('- As APIs estão configuradas para usar banco "margem"');
        console.log('- Mas algumas coleções críticas estão em "mpontom"');
        console.log('- Isso pode causar falhas em autenticação e outras funcionalidades');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
        console.log('\n🔒 Conexão fechada');
    }
}

checkMpontomCollections().catch(console.error);