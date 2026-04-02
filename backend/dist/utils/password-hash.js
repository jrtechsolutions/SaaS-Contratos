/**
 * Script auxiliar para gerar hash de senha
 * Uso: node src/utils/password-hash.js "senha123"
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Uso: node password-hash.js "sua-senha"');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nHash gerado:');
  console.log(hash);
  console.log('\nUse este hash no banco de dados ou na migration SQL.\n');
});

