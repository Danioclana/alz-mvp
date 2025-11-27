import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não está definida');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp',
    'gemini-pro',
];

async function testModel(modelName: string): Promise<boolean> {
    try {
        console.log(`\n🧪 Testando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Responda apenas "OK"');
        const response = result.response;
        const text = response.text();

        console.log(`✅ ${modelName} funcionou! Resposta: ${text}`);
        return true;
    } catch (error: any) {
        if (error.status === 404) {
            console.log(`❌ ${modelName} - Não encontrado (404)`);
        } else if (error.status === 503) {
            console.log(`⚠️  ${modelName} - Sobrecarregado (503)`);
        } else {
            console.log(`❌ ${modelName} - Erro: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log('🔍 Testando modelos disponíveis do Gemini...\n');
    console.log('═'.repeat(50));

    const results: { model: string; works: boolean }[] = [];

    for (const modelName of modelsToTest) {
        const works = await testModel(modelName);
        results.push({ model: modelName, works });

        // Pequeno delay entre testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '═'.repeat(50));
    console.log('\n📊 RESUMO DOS RESULTADOS:\n');

    const workingModels = results.filter(r => r.works);
    const failedModels = results.filter(r => !r.works);

    if (workingModels.length > 0) {
        console.log('✅ Modelos funcionando:');
        workingModels.forEach(r => console.log(`   - ${r.model}`));

        console.log('\n💡 RECOMENDAÇÃO:');
        console.log(`   Adicione ao seu .env:`);
        console.log(`   GEMINI_MODEL=${workingModels[0].model}`);
    }

    if (failedModels.length > 0) {
        console.log('\n❌ Modelos com problemas:');
        failedModels.forEach(r => console.log(`   - ${r.model}`));
    }
}

main().catch(console.error);
