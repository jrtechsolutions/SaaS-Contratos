/**
 * Script para corrigir/atualizar senha de um usuário
 * Uso: node src/scripts/fix-user-password.js email@example.com nova-senha
 */
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Uso: node src/scripts/fix-user-password.js email@example.com nova-senha');
  process.exit(1);
}

async function fixPassword() {
  try {
    console.log('🔧 Corrigindo senha do usuário...\n');

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .single();

    if (findError || !user) {
      console.error('❌ Usuário não encontrado:', normalizedEmail);
      process.exit(1);
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('🔐 Gerando novo hash de senha...\n');

    // Gerar novo hash
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash })
      .eq('id', user.id)
      .select('id, email')
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Senha atualizada com sucesso!');
    console.log('📧 Email:', updated.email);
    console.log('🔑 Nova senha:', newPassword);
    console.log('\n💡 Agora você pode fazer login com estas credenciais.\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixPassword();

