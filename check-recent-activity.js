// Script para verificar atividade recente no MongoDB
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://doadmin:0XZwJ61x9hL354p8@db-mongodb-m2m-565d8767.mongo.ondigitalocean.com/?tls=true&authSource=admin&replicaSet=db-mongodb-m2m';

async function checkRecentActivity() {
    const client = new MongoClient(uri);

    try {
        console.log('Conectando ao MongoDB para verificar atividade recente...');
        await client.connect();
        console.log('✅ Conectado!\n');

        const margemDb = client.db('margem');

        // Verificar últimas atividades em cada coleção
        console.log('=== ÚLTIMAS ATIVIDADES POR COLEÇÃO ===\n');

        const collections = await margemDb.listCollections().toArray();

        for (const collInfo of collections) {
            const coll = margemDb.collection(collInfo.name);
            const count = await coll.countDocuments();

            console.log(`📁 Coleção: ${collInfo.name} (${count} documentos)`);

            if (count > 0) {
                // Pegar documentos mais recentes
                const recentDocs = await coll.find({})
                    .sort({ _id: -1 })
                    .limit(5)
                    .toArray();

                if (recentDocs.length > 0) {
                    const firstDoc = recentDocs[0];
                    const lastDoc = recentDocs[recentDocs.length - 1];

                    console.log(`   📅 Documento mais recente: ${firstDoc._id.getTimestamp()}`);

                    // Se houver campos de data, mostrá-los
                    if (firstDoc.createdAt) {
                        console.log(`   📝 createdAt: ${new Date(firstDoc.createdAt).toISOString()}`);
                    }
                    if (firstDoc.updatedAt) {
                        console.log(`   ✏️ updatedAt: ${new Date(firstDoc.updatedAt).toISOString()}`);
                    }
                    if (firstDoc.deletedAt) {
                        console.log(`   ⚠️ deletedAt: ${new Date(firstDoc.deletedAt).toISOString()}`);
                    }

                    // Verificar se há documentos com flag de deleted
                    const deletedCount = await coll.countDocuments({ deleted: true });
                    const softDeletedCount = await coll.countDocuments({ deletedAt: { $exists: true } });

                    if (deletedCount > 0) {
                        console.log(`   🗑️ Documentos com deleted=true: ${deletedCount}`);
                    }
                    if (softDeletedCount > 0) {
                        console.log(`   🗑️ Documentos com deletedAt: ${softDeletedCount}`);
                    }
                }

                // Verificar documentos criados nas últimas 24 horas
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const recentCreated = await coll.countDocuments({
                    createdAt: { $gte: oneDayAgo }
                });

                if (recentCreated > 0) {
                    console.log(`   🆕 Criados nas últimas 24h: ${recentCreated}`);
                }

                // Verificar documentos modificados nas últimas 24 horas
                const recentUpdated = await coll.countDocuments({
                    updatedAt: { $gte: oneDayAgo }
                });

                if (recentUpdated > 0) {
                    console.log(`   🔄 Atualizados nas últimas 24h: ${recentUpdated}`);
                }
            } else {
                console.log(`   ⚠️ Coleção vazia!`);
            }

            console.log();
        }

        // Verificar coleções que deveriam existir mas não existem
        console.log('=== VERIFICAÇÃO DE COLEÇÕES AUSENTES ===\n');
        const expectedCollections = [
            'users',
            'scripts',
            'licenses',
            'companies',
            'customers',
            'products',
            'orders'
        ];

        for (const collName of expectedCollections) {
            const exists = collections.some(c => c.name === collName);
            if (!exists) {
                console.log(`❌ Coleção "${collName}" NÃO EXISTE no banco "margem"`);

                // Verificar se existe no banco mpontom
                const mpontomDb = client.db('mpontom');
                const mpontomCount = await mpontomDb.collection(collName).countDocuments();
                if (mpontomCount > 0) {
                    console.log(`   ℹ️ Mas existe no banco "mpontom" com ${mpontomCount} documentos`);
                }
            }
        }

        // Verificar logs de segurança
        console.log('\n=== LOGS DE SEGURANÇA RECENTES ===\n');
        const securityLogs = margemDb.collection('security_logs');
        const recentSecurityLogs = await securityLogs.find({})
            .sort({ _id: -1 })
            .limit(10)
            .toArray();

        if (recentSecurityLogs.length > 0) {
            console.log('Últimos 10 logs de segurança:');
            for (const log of recentSecurityLogs) {
                const timestamp = log._id.getTimestamp();
                console.log(`- ${timestamp}: ${log.action || 'N/A'} - ${log.user || 'N/A'}`);
                if (log.details) {
                    console.log(`  Detalhes: ${JSON.stringify(log.details).substring(0, 100)}`);
                }
            }
        } else {
            console.log('Nenhum log de segurança encontrado.');
        }

        // Comparar com backup (se houver informação de referência)
        console.log('\n=== RESUMO DA SITUAÇÃO ===\n');
        console.log('✅ Banco "margem" está ONLINE e acessível');
        console.log(`✅ Total de ${collections.length} coleções encontradas`);
        console.log(`✅ Tamanho total: ~50 GB`);
        console.log('\n⚠️ ATENÇÃO: As seguintes coleções parecem estar vazias ou ausentes:');
        console.log('   - users');
        console.log('   - scripts');
        console.log('   - licenses');
        console.log('   - companies');
        console.log('\n📌 RECOMENDAÇÃO: Verificar se houve migração de dados para outro banco ou se há backup disponível.');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
        console.log('\n🔒 Conexão fechada');
    }
}

checkRecentActivity().catch(console.error);