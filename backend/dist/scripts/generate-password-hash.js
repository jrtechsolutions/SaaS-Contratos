/**
 * Script para gerar hash bcrypt de senhas
 * 
 * Uso:
 * node src/scripts/generate-password-hash.js "suaSenhaAqui"
 * 
 * Ou execute sem argumentos para usar senha padrão "admin123"
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n========================================');
    console.log('Hash bcrypt gerado com sucesso!');
    console.log('========================================\n');
    console.log('Senha:', password);
    console.log('Hash:', hash);
    console.log('\nUse este hash no script SQL para criar o usuário.\n');
    console.log('Exemplo de INSERT:');
    console.log(`INSERT INTO users (email, password_hash, full_name)`);
    console.log(`VALUES (`);
    console.log(`  'seu-email@exemplo.com',`);
    console.log(`  '${hash}',`);
    console.log(`  'Nome do Usuário'`);
    console.log(`);\n`);
  })
  .catch(error => {
    console.error('Erro ao gerar hash:', error);
    process.exit(1);
  });
