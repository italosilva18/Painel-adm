// Script para verificar detalhadamente a coleção reports
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://doadmin:0XZwJ61x9hL354p8@db-mongodb-m2m-565d8767.mongo.ondigitalocean.com/?tls=true&authSource=admin&replicaSet=db-mongodb-m2m';

async function checkReportsCollection() {
    const client = new MongoClient(uri);

    try {
        console.log('🔍 VERIFICAÇÃO DETALHADA DA COLEÇÃO "reports" NO BANCO "margem"\n');
        console.log('============================================================\n');

        await client.connect();

        const margemDb = client.db('margem');
        const reportsColl = margemDb.collection('reports');

        // 1. Contagem total
        console.log('📊 CONTAGEM DE DOCUMENTOS:');
        const totalCount = await reportsColl.countDocuments();
        console.log(`   Total atual: ${totalCount.toLocaleString('pt-BR')} documentos`);

        if (totalCount < 200000) {
            console.log(`   ⚠️ ATENÇÃO: Esperado ~200.000, encontrado apenas ${totalCount.toLocaleString('pt-BR')}`);
            console.log(`   📉 PERDA APARENTE: ${(200000 - totalCount).toLocaleString('pt-BR')} documentos\n`);
        } else {
            console.log(`   ✅ Contagem está dentro do esperado\n`);
        }

        // 2. Verificar range de datas
        console.log('📅 ANÁLISE TEMPORAL DOS REPORTS:');

        // Documento mais antigo
        const oldestDoc = await reportsColl.findOne({}, { sort: { _id: 1 } });
        if (oldestDoc) {
            console.log(`   Report mais antigo: ${oldestDoc._id.getTimestamp()}`);
            if (oldestDoc.date) {
                console.log(`   Data do report: ${oldestDoc.date}`);
            }
        }

        // Documento mais recente
        const newestDoc = await reportsColl.findOne({}, { sort: { _id: -1 } });
        if (newestDoc) {
            console.log(`   Report mais recente: ${newestDoc._id.getTimestamp()}`);
            if (newestDoc.date) {
                console.log(`   Data do report: ${newestDoc.date}`);
            }
        }

        // 3. Análise por período
        console.log('\n📈 DISTRIBUIÇÃO DE REPORTS POR PERÍODO:');

        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

        // Contar por período usando _id (ObjectId tem timestamp)
        const last24h = await reportsColl.countDocuments({
            _id: { $gte: ObjectId.createFromTime(Math.floor(oneDayAgo.getTime() / 1000)) }
        });

        const lastWeek = await reportsColl.countDocuments({
            _id: { $gte: ObjectId.createFromTime(Math.floor(oneWeekAgo.getTime() / 1000)) }
        });

        const lastMonth = await reportsColl.countDocuments({
            _id: { $gte: ObjectId.createFromTime(Math.floor(oneMonthAgo.getTime() / 1000)) }
        });

        console.log(`   Últimas 24 horas: ${last24h.toLocaleString('pt-BR')}`);
        console.log(`   Última semana: ${lastWeek.toLocaleString('pt-BR')}`);
        console.log(`   Último mês: ${lastMonth.toLocaleString('pt-BR')}`);

        // 4. Análise de campos disponíveis
        console.log('\n🔍 ESTRUTURA DOS REPORTS:');
        const sampleReports = await reportsColl.find({}).limit(5).toArray();

        if (sampleReports.length > 0) {
            const fields = Object.keys(sampleReports[0]);
            console.log(`   Campos encontrados: ${fields.join(', ')}`);

            // Verificar se há campo de soft delete
            const withDeleted = await reportsColl.countDocuments({ deleted: true });
            const withDeletedAt = await reportsColl.countDocuments({ deletedAt: { $exists: true } });

            if (withDeleted > 0) {
                console.log(`   ⚠️ Reports marcados como deletados: ${withDeleted.toLocaleString('pt-BR')}`);
            }
            if (withDeletedAt > 0) {
                console.log(`   ⚠️ Reports com deletedAt: ${withDeletedAt.toLocaleString('pt-BR')}`);
            }
        }

        // 5. Verificar índices
        console.log('\n📋 ÍNDICES DA COLEÇÃO:');
        const indexes = await reportsColl.indexes();
        indexes.forEach(index => {
            console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // 6. Estatísticas da coleção
        console.log('\n📊 ESTATÍSTICAS DA COLEÇÃO:');
        const stats = await margemDb.command({ collStats: 'reports' });
        console.log(`   Tamanho total: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Tamanho médio por documento: ${stats.avgObjSize} bytes`);
        console.log(`   Armazenamento: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

        // 7. Verificar se há reports em outros bancos
        console.log('\n🔄 VERIFICANDO OUTROS BANCOS:');

        // Verificar mpontom
        const mpontomDb = client.db('mpontom');
        const mpontomReports = await mpontomDb.collection('reports').countDocuments();
        const mpontomReport = await mpontomDb.collection('report').countDocuments();

        console.log(`   Banco "mpontom":`);
        console.log(`     - Coleção "reports": ${mpontomReports.toLocaleString('pt-BR')} documentos`);
        console.log(`     - Coleção "report": ${mpontomReport.toLocaleString('pt-BR')} documentos`);

        // 8. Análise de possível migração
        console.log('\n⚡ ANÁLISE FINAL:');
        console.log('============================================================');

        if (totalCount < 200000) {
            console.log('❌ PERDA DE DADOS CONFIRMADA!');
            console.log(`   - Esperado: ~200.000 reports`);
            console.log(`   - Encontrado: ${totalCount.toLocaleString('pt-BR')} reports`);
            console.log(`   - Diferença: ${(200000 - totalCount).toLocaleString('pt-BR')} reports PERDIDOS`);
            console.log('\n📝 POSSÍVEIS CAUSAS:');
            console.log('   1. Operação de DELETE em massa (acidental ou intencional)');
            console.log('   2. Migração incompleta de dados');
            console.log('   3. Limpeza automática por algum processo');
            console.log('   4. Problema durante backup/restore');
            console.log('\n🔧 AÇÕES RECOMENDADAS:');
            console.log('   1. Verificar backups no DigitalOcean imediatamente');
            console.log('   2. Checar logs do MongoDB para operações de DELETE');
            console.log('   3. Verificar se há scripts de limpeza automática rodando');
            console.log('   4. Contactar DigitalOcean para recuperação de snapshot');
        } else {
            console.log('✅ Todos os reports parecem estar presentes');
        }


    } catch (error) {
        console.error('❌ Erro ao verificar:', error.message);
        console.error(error);
    } finally {
        await client.close();
        console.log('\n🔒 Conexão fechada');
    }
}

checkReportsCollection().catch(console.error);