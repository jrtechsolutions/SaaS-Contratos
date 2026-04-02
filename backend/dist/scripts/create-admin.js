/**
 * Script para criar usuário admin inicial
 * Uso: node src/scripts/create-admin.js
 */
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';
const fullName = process.argv[4] || 'Administrador';

async function createAdmin() {
  try {
    console.log('🔐 Criando usuário admin...\n');

    // Verificar se já existe (normalizar email)
    const normalizedEmail = email.toLowerCase().trim();
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      console.log('❌ Usuário já existe com este email:', email);
      process.exit(1);
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Criar usuário
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash,
        full_name: fullName
      })
      .select('id, email, full_name')
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      process.exit(1);
    }

    console.log('✅ Usuário admin criado com sucesso!\n');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', user.full_name);
    console.log('🔑 Senha:', password);
    console.log('\n💡 Use estas credenciais para fazer login na API.\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdmin();

