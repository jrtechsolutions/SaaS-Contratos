/**
 * Script simplificado para executar migrations via Supabase Admin
 * Usa uma abordagem mais direta criando as tabelas uma por uma
 */
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTables() {
  console.log('🚀 Criando tabelas automaticamente no Supabase...\n');

  try {
    // Criar tabela users
    console.log('📦 Criando tabela: users...');
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).catch(async () => {
      // Se RPC não existir, tentar criar via query direta
      // Infelizmente, o Supabase JS não suporta DDL direto
      console.log('   ⚠️  Método RPC não disponível');
      return { error: { message: 'RPC não disponível' } };
    });

    if (usersError) {
      console.log('   ⚠️  Erro:', usersError.message);
    } else {
      console.log('   ✅ Tabela users criada');
    }

    console.log('\n💡 IMPORTANTE: O Supabase JS Client não suporta execução direta de DDL (CREATE TABLE, etc.)');
    console.log('   Você precisa executar o SQL manualmente no SQL Editor.\n');
    console.log('📝 Passos:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/_/sql');
    console.log('   2. Abra: backend/src/migrations/001_create_tables.sql');
    console.log('   3. Copie TODO o conteúdo');
    console.log('   4. Cole no SQL Editor e execute (Ctrl+Enter)\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTables();

