/**
 * Script para executar migrations no Supabase
 * Verifica conexão e executa os scripts SQL
 */
import { supabaseAdmin } from '../config/supabase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('🔍 Verificando conexão com Supabase...\n');

    // Testar conexão
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      // PGRST116 = tabela não existe (esperado)
      if (testError.code === '42P01') {
        console.log('⚠️  Tabelas não existem ainda. Vamos criá-las...\n');
      } else {
        console.error('❌ Erro ao conectar ao Supabase:', testError.message);
        console.error('\n📋 Verifique suas variáveis de ambiente:');
        console.error('   - SUPABASE_URL');
        console.error('   - SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
      }
    } else {
      console.log('✅ Conexão com Supabase estabelecida!\n');
    }

    console.log('📝 IMPORTANTE: As migrations devem ser executadas manualmente no SQL Editor do Supabase.\n');
    console.log('📂 Arquivos de migration:');
    console.log('   1. src/migrations/001_create_tables.sql');
    console.log('   2. src/migrations/002_insert_default_data.sql\n');
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/_/sql\n');
    console.log('💡 Copie e cole o conteúdo de cada arquivo SQL no editor e execute.\n');

    // Tentar ler e mostrar o conteúdo do primeiro arquivo como exemplo
    try {
      const migrationPath = join(__dirname, '001_create_tables.sql');
      const migrationContent = readFileSync(migrationPath, 'utf-8');
      console.log('📄 Conteúdo do primeiro arquivo (001_create_tables.sql):\n');
      console.log('─'.repeat(60));
      console.log(migrationContent.substring(0, 500) + '...\n');
      console.log('─'.repeat(60));
      console.log('\n💡 Execute este script completo no SQL Editor do Supabase.\n');
    } catch (err) {
      console.log('⚠️  Não foi possível ler o arquivo de migration.\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n📋 Verifique:');
    console.error('   1. Se o arquivo .env existe e está configurado');
    console.error('   2. Se as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão corretas');
    console.error('   3. Se você tem acesso ao projeto no Supabase');
    process.exit(1);
  }
}

runMigrations();

