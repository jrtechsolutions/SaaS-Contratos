/**
 * Script para executar migrations usando Supabase CLI
 * Se o CLI não estiver instalado, fornece instruções claras
 */
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkSupabaseCLI() {
  try {
    const { stdout } = await execAsync('supabase --version');
    return { installed: true, version: stdout.trim() };
  } catch {
    return { installed: false };
  }
}

async function runMigrationsWithCLI() {
  console.log('🚀 Executando migrations com Supabase CLI...\n');

  try {
    // Verificar se CLI está instalado
    const cliCheck = await checkSupabaseCLI();
    
    if (!cliCheck.installed) {
      console.log('❌ Supabase CLI não está instalado\n');
      console.log('📦 Para instalar:');
      console.log('   Windows (PowerShell):');
      console.log('     iwr https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip -OutFile supabase.zip');
      console.log('   macOS:');
      console.log('     brew install supabase/tap/supabase');
      console.log('   Linux:');
      console.log('     curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz\n');
      console.log('💡 Alternativa: Execute o SQL manualmente no SQL Editor\n');
      return false;
    }

    console.log(`✅ Supabase CLI encontrado: ${cliCheck.version}\n`);

    // Verificar se está logado
    try {
      await execAsync('supabase projects list');
      console.log('✅ Autenticado no Supabase CLI\n');
    } catch {
      console.log('⚠️  Você precisa fazer login no Supabase CLI\n');
      console.log('   Execute: supabase login\n');
      return false;
    }

    // Ler arquivo SQL
    const migrationPath = join(__dirname, '001_create_tables.sql');
    const sqlContent = readFileSync(migrationPath, 'utf-8');

    // Criar arquivo temporário
    const tempFile = join(__dirname, 'temp_migration.sql');
    writeFileSync(tempFile, sqlContent);

    console.log('📝 Executando SQL no banco de dados...\n');

    // Obter project ID do .env
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL não configurado');
    }

    // Extrair project ref da URL
    const projectMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!projectMatch) {
      throw new Error('Não foi possível extrair project ref da URL');
    }

    const projectRef = projectMatch[1];
    console.log(`📦 Project: ${projectRef}\n`);

    // Executar SQL via CLI
    try {
      const { stdout, stderr } = await execAsync(
        `supabase db execute --file "${tempFile}" --project-id ${projectRef}`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.error(stderr);

      console.log('\n✅ Migration executada com sucesso!\n');

      // Limpar arquivo temporário
      unlinkSync(tempFile);

      return true;
    } catch (error) {
      console.error('❌ Erro ao executar migration:', error.message);
      console.log('\n💡 Tente executar manualmente no SQL Editor\n');
      
      // Limpar arquivo temporário
      try {
        unlinkSync(tempFile);
      } catch {}

      return false;
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

// Método alternativo: usar psql diretamente se disponível
async function runMigrationsWithPSQL() {
  console.log('🔍 Tentando método alternativo com psql...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD; // Precisa estar no .env

  if (!dbPassword) {
    console.log('⚠️  SUPABASE_DB_PASSWORD não configurado no .env\n');
    return false;
  }

  // Extrair informações de conexão da URL
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) return false;

  const projectRef = urlMatch[1];
  const dbHost = `${projectRef}.supabase.co`;
  const dbPort = 5432;
  const dbName = 'postgres';
  const dbUser = 'postgres';

  try {
    const migrationPath = join(__dirname, '001_create_tables.sql');
    const sqlContent = readFileSync(migrationPath, 'utf-8');

    const { stdout } = await execAsync(
      `psql "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}" -c "${sqlContent.replace(/"/g, '\\"')}"`
    );

    console.log(stdout);
    console.log('✅ Migration executada com psql!\n');
    return true;
  } catch (error) {
    console.log('⚠️  psql não disponível ou erro na conexão\n');
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando execução automática de migrations...\n');

  // Tentar método 1: Supabase CLI
  const cliSuccess = await runMigrationsWithCLI();
  if (cliSuccess) {
    console.log('✅ Migrations concluídas!\n');
    return;
  }

  // Tentar método 2: psql
  const psqlSuccess = await runMigrationsWithPSQL();
  if (psqlSuccess) {
    console.log('✅ Migrations concluídas!\n');
    return;
  }

  // Se nenhum método funcionou, mostrar instruções
  console.log('⚠️  Não foi possível executar automaticamente\n');
  console.log('📝 INSTRUÇÕES MANUAIS:\n');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/_/sql');
  console.log('   2. Abra o arquivo: backend/src/migrations/001_create_tables.sql');
  console.log('   3. Copie TODO o conteúdo');
  console.log('   4. Cole no SQL Editor');
  console.log('   5. Execute (Ctrl+Enter)\n');
  
  console.log('💡 Para automatizar no futuro:');
  console.log('   - Instale o Supabase CLI: https://supabase.com/docs/guides/cli');
  console.log('   - Ou configure psql com SUPABASE_DB_PASSWORD no .env\n');
}

main();

