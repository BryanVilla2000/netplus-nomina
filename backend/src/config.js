require('dotenv').config({ quiet: true });
const { z } = require('zod');

// Lee el archivo .env 
const esquema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'debe tener al menos 32 caracteres'),
  JWT_EXPIRA: z.string().default('8h'),
  SEED_PASSWORD: z.string().min(8, 'debe tener al menos 8 caracteres').optional(),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  console.error('Configuración inválida en backend/.env:');
  for (const problema of resultado.error.issues) {
    console.error(`  - ${problema.path.join('.')}: ${problema.message}`);
  }
  process.exit(1);
}

module.exports = resultado.data;