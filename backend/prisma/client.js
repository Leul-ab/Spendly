import { createRequire } from 'module';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

// createRequire scoped to THIS file (prisma/client.js),
// so '../src/generated/prisma' resolves to src/generated/prisma
const require = createRequire(import.meta.url);

const { PrismaClient } = require('../src/generated/prisma');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;
