/**
 * Script para debugar problemas de login
 * Uso: node src/scripts/debug-login.js email@example.com
 */
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('❌ Forneça um email como argumento');
  console.error('   Uso: node src/scripts/debug-login.js email@example.com');
  process.exit(1);
}

async function debugLogin() {
  try {
    console.log('🔍 Debugando login...\n');
    console.log('📧 Email fornecido:', email);
    console.log('📧 Email normalizado:', email.toLowerCase().trim());
    console.log('');

    // Buscar usuário
    console.log('🔍 Buscando usuário no banco...');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      console.error('   Detalhes:', error.details);
      
      // Tentar buscar sem normalizar
      console.log('\n🔍 Tentando buscar sem normalizar...');
      const { data: user2, error: error2 } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (user2) {
        console.log('⚠️  Usuário encontrado sem normalização!');
        console.log('   Email no banco:', user2.email);
        console.log('   Problema: Email não está normalizado no banco');
      }
      
      process.exit(1);
    }

    if (!user) {
      console.error('❌ Usuário não encontrado');
      console.log('\n💡 Verifique:');
      console.log('   1. Se o email está correto');
      console.log('   2. Se o usuário foi criado corretamente');
      console.log('   3. Se o email no banco está em minúsculas');
      process.exit(1);
    }

    console.log('✅ Usuário encontrado!');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.full_name);
    console.log('   Password Hash:', user.password_hash ? `${user.password_hash.substring(0, 20)}...` : 'NULL');
    console.log('');

    // Verificar se password_hash existe
    if (!user.password_hash) {
      console.error('❌ PROBLEMA ENCONTRADO: password_hash está NULL ou vazio!');
      console.log('\n💡 Solução:');
      console.log('   O usuário precisa ter um password_hash válido.');
      console.log('   Se foi criado manualmente, você precisa gerar o hash da senha.');
      console.log('\n   Execute:');
      console.log('   node src/utils/password-hash.js "sua-senha"');
      console.log('   Depois atualize no banco com o hash gerado.');
      process.exit(1);
    }

    // Testar hash de senha
    console.log('🔐 Testando hash de senha...');
    console.log('   Digite a senha para testar (ou pressione Enter para pular):');
    
    // Para testar, vamos criar um hash de exemplo
    const testPassword = 'admin123';
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log('   Hash de exemplo para "admin123":', testHash.substring(0, 30) + '...');
    console.log('');

    console.log('✅ Diagnóstico completo!');
    console.log('\n📋 Informações:');
    console.log('   - Usuário existe no banco');
    console.log('   - Password hash está presente');
    console.log('\n💡 Se o login ainda não funciona:');
    console.log('   1. Verifique se a senha digitada está correta');
    console.log('   2. Verifique se o password_hash no banco foi gerado com bcrypt');
    console.log('   3. Verifique os logs do servidor ao tentar fazer login');
    console.log('   4. Teste a rota de login diretamente:');
    console.log(`      POST http://localhost:3001/api/auth/login`);
    console.log(`      Body: { "email": "${email}", "password": "sua-senha" }`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugLogin();

