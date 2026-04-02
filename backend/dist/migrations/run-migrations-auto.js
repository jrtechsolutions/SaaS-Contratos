/**
 * Script para executar migrations automaticamente no Supabase
 * Uso: node src/migrations/run-migrations-auto.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.error('   Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

/**
 * Executa SQL no Supabase usando a API REST
 */
async function executeSQL(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Se o endpoint RPC não existir, tentar método alternativo
    throw error;
  }
}

/**
 * Executa SQL usando método alternativo via pg_net ou função customizada
 */
async function executeSQLAlternative(sql) {
  // Dividir o SQL em comandos individuais
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

  // Usar o cliente Supabase Admin para executar via função SQL
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Criar uma função temporária para executar SQL
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_text;
    END;
    $$;
  `;

  try {
    // Tentar criar a função helper
    await supabase.rpc('exec_sql', { sql_text: createFunctionSQL }).catch(() => {});
  } catch (e) {
    // Ignorar se já existir
  }

  // Executar cada comando
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd.length < 10) continue; // Pular comandos muito curtos

    try {
      // Tentar executar via RPC
      await supabase.rpc('exec_ddl', { sql_text: cmd + ';' });
      console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
    } catch (error) {
      // Se não funcionar, tentar método direto via fetch
      console.log(`⚠️  Tentando método alternativo para comando ${i + 1}...`);
    }
  }
}

/**
 * Método mais direto: usar a API do PostgREST com SQL direto
 */
async function executeSQLDirect(sql) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  // O Supabase JS não suporta execução direta de DDL
  // Vamos usar uma abordagem diferente: criar as tabelas via queries individuais
  
  console.log('📝 Criando tabelas via Supabase Admin Client...\n');

  // Ler e executar o SQL em partes
  const sqlContent = sql;
  
  // Dividir em blocos lógicos
  const blocks = sqlContent
    .split(/;\s*(?=CREATE|DROP|INSERT|COMMENT)/)
    .map(b => b.trim())
    .filter(b => b.length > 0 && !b.startsWith('--'));

  for (const block of blocks) {
    if (block.includes('CREATE TABLE')) {
      // Extrair nome da tabela
      const tableMatch = block.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        console.log(`📦 Criando tabela: ${tableName}...`);
        
        // Verificar se já existe
        const { data: exists } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .catch(() => ({ data: null }));

        if (exists !== null) {
          console.log(`   ⚠️  Tabela ${tableName} já existe, pulando...`);
          continue;
        }
      }
    }

    // Tentar executar via função SQL do Supabase
    try {
      // Usar a API REST diretamente
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: block }),
      });

      if (response.ok || response.status === 201) {
        console.log(`   ✅ Executado com sucesso`);
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Status ${response.status}, mas continuando...`);
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao executar: ${error.message}`);
      console.log(`   💡 Você precisará executar manualmente no SQL Editor`);
    }
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Iniciando execução automática de migrations...\n');
    console.log('📋 Verificando configuração...\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    console.log('✅ Configuração OK\n');

    // Ler arquivo de migration
    const migrationPath = join(__dirname, '001_create_tables.sql');
    console.log(`📂 Lendo arquivo: ${migrationPath}\n`);
    
    const sqlContent = readFileSync(migrationPath, 'utf-8');
    console.log(`📄 Arquivo lido (${sqlContent.length} caracteres)\n`);

    // Tentar executar usando método mais confiável
    console.log('🔧 Executando SQL no Supabase...\n');
    
    // Método: usar pg_net ou criar função helper
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Dividir SQL em comandos executáveis
    // Remover comentários e dividir por ponto e vírgula
    const cleanSQL = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');

    const commands = cleanSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 10); // Filtrar comandos muito curtos

    console.log(`📝 Encontrados ${commands.length} comandos SQL\n`);

    // Executar cada comando via API HTTP direta
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (!cmd || cmd.length < 10) continue;

      try {
        // Usar a API REST do Supabase para executar SQL
        // Nota: Isso requer que o Supabase tenha a extensão pg_net habilitada
        // ou usar uma abordagem diferente
        
        // Tentar via fetch direto para o endpoint de SQL
        const sqlEndpoint = `${SUPABASE_URL.replace('/rest/v1', '')}/functions/v1/exec-sql`;
        
        const response = await fetch(sqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql: cmd }),
        }).catch(() => null);

        if (response && response.ok) {
          successCount++;
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } else {
          // Se não funcionar, vamos usar uma abordagem diferente
          errorCount++;
          console.log(`⚠️  Comando ${i + 1} precisa ser executado manualmente`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ Erro no comando ${i + 1}: ${error.message}`);
      }
    }

    console.log(`\n📊 Resultado: ${successCount} sucessos, ${errorCount} erros\n`);

    if (errorCount > 0) {
      console.log('⚠️  Alguns comandos falharam.');
      console.log('💡 Recomendação: Execute o SQL manualmente no SQL Editor do Supabase');
      console.log('   Arquivo: backend/src/migrations/001_create_tables.sql\n');
    } else {
      console.log('✅ Todas as migrations foram executadas com sucesso!\n');
    }

    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...\n');
    
    const tables = ['users', 'modelos_contrato', 'propostas', 'contratos'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log(`❌ Tabela '${table}' não encontrada`);
      } else if (error && error.code === '42P01') {
        console.log(`❌ Tabela '${table}' não existe`);
      } else {
        console.log(`✅ Tabela '${table}' existe`);
      }
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error.message);
    console.error('\n💡 Solução alternativa:');
    console.error('   1. Acesse o SQL Editor do Supabase');
    console.error('   2. Copie o conteúdo de: backend/src/migrations/001_create_tables.sql');
    console.error('   3. Cole e execute no SQL Editor\n');
    process.exit(1);
  }
}

runMigrations();

