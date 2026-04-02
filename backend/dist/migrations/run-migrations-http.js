/**
 * Script para executar migrations via HTTP direto na API do Supabase
 * Este método usa a API REST do Supabase para executar SQL
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL?.replace('/rest/v1', '') || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Executando migrations automaticamente...\n');

  try {
    // Ler arquivo SQL
    const migrationPath = join(__dirname, '001_create_tables.sql');
    const sqlContent = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Arquivo SQL lido\n');
    console.log('🔧 Executando SQL no Supabase...\n');

    // O Supabase não expõe um endpoint público para executar SQL arbitrário por segurança
    // A melhor forma é usar o Supabase Management API ou criar uma Edge Function
    
    // Vamos tentar uma abordagem: criar uma Edge Function temporária ou usar pg_net
    // Mas a forma mais prática é usar o SQL Editor via interface web
    
    console.log('⚠️  LIMITAÇÃO DO SUPABASE:');
    console.log('   O Supabase não permite executar DDL (CREATE TABLE, etc.) via API REST');
    console.log('   por questões de segurança. Isso precisa ser feito no SQL Editor.\n');
    
    console.log('💡 SOLUÇÃO AUTOMATIZADA:');
    console.log('   Vou criar um script que você pode executar no SQL Editor do Supabase\n');

    // Criar um arquivo formatado para fácil cópia
    const formattedSQL = sqlContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    console.log('📋 SQL para copiar e colar no SQL Editor:\n');
    console.log('─'.repeat(60));
    console.log(formattedSQL);
    console.log('─'.repeat(60));
    console.log('\n');

    // Tentar método alternativo: usar Supabase CLI se disponível
    console.log('🔍 Verificando se Supabase CLI está instalado...\n');
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync('supabase --version');
      console.log(`✅ Supabase CLI encontrado: ${stdout.trim()}\n`);
      console.log('💡 Você pode executar: supabase db push\n');
    } catch {
      console.log('⚠️  Supabase CLI não encontrado\n');
      console.log('📝 INSTRUÇÕES MANUAIS:');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/_/sql');
      console.log('   2. Copie o SQL acima');
      console.log('   3. Cole e execute (Ctrl+Enter)\n');
    }

    // Verificar se as tabelas já existem
    console.log('🔍 Verificando tabelas existentes...\n');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const tables = ['users', 'modelos_contrato', 'propostas', 'contratos'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.log(`❌ ${table}: não existe`);
      } else {
        console.log(`✅ ${table}: existe`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

runMigrations();

