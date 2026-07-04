/**
 * Executa a migration 010 (tipos de proposta e precificação)
 * Uso: npm run migrate:010
 *
 * Requer SUPABASE_DB_PASSWORD no .env
 * (Supabase Dashboard → Project Settings → Database → Database password)
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL não configurado no .env');
    process.exit(1);
  }

  if (!dbPassword) {
    console.error('❌ SUPABASE_DB_PASSWORD não configurado no .env');
    console.error('');
    console.error('   1. Acesse: https://supabase.com/dashboard/project/oijqeuaxnjzvwpvwzzca/settings/database');
    console.error('   2. Copie a senha do banco (Database password)');
    console.error('   3. Adicione no backend/.env: SUPABASE_DB_PASSWORD=sua_senha');
    console.error('   4. Execute novamente: npm run migrate:010');
    console.error('');
    console.error('   Alternativa manual: cole o SQL de src/migrations/010_add_tipo_proposta_pricing.sql');
    console.error('   no SQL Editor: https://supabase.com/dashboard/project/oijqeuaxnjzvwpvwzzca/sql/new');
    process.exit(1);
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.error('❌ Não foi possível extrair o project ref da SUPABASE_URL');
    process.exit(1);
  }

  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

  const migrationPath = join(__dirname, '010_add_tipo_proposta_pricing.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Executando migration 010...\n');

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ Migration 010 aplicada com sucesso!\n');

    const { rows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'propostas'
        AND column_name IN ('tipo_proposta', 'valor_implantacao', 'modulos', 'valor_mensalidade_total')
      ORDER BY column_name
    `);

    console.log('📋 Colunas verificadas:', rows.map((r) => r.column_name).join(', '));
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
