/**
 * Script para verificar conexão com Supabase
 * Uso: node src/scripts/check-connection.js
 */
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  console.log('🔍 Verificando configuração do Supabase...\n');

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Variáveis de ambiente:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);
  if (supabaseUrl) {
    console.log(`      Valor: ${supabaseUrl.substring(0, 30)}...`);
  }
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Configurado' : '❌ Não configurado'}`);
  if (supabaseKey) {
    console.log(`      Valor: ${supabaseKey.substring(0, 20)}...`);
  }
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    console.error('\n📝 Crie um arquivo .env na pasta backend com:');
    console.error('   SUPABASE_URL=https://seu-projeto.supabase.co');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role');
    process.exit(1);
  }

  try {
    console.log('🔌 Testando conexão com Supabase...\n');

    // Tentar uma query simples
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Conexão OK, mas as tabelas ainda não foram criadas.');
        console.log('   Execute as migrations no SQL Editor do Supabase.\n');
      } else {
        console.error('❌ Erro na conexão:', error.message);
        console.error('   Código:', error.code);
        process.exit(1);
      }
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('✅ Tabelas existem no banco de dados.\n');
    }

    console.log('✅ Tudo configurado corretamente!\n');

  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('\n📋 Verifique:');
    console.error('   1. Se a URL do Supabase está correta');
    console.error('   2. Se a Service Role Key está correta');
    console.error('   3. Se você tem acesso ao projeto no Supabase');
    process.exit(1);
  }
}

checkConnection();

