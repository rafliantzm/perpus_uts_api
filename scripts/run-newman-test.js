import { spawn } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

if (!process.env.DB_PASSWORD) {
  throw new Error(
    'DB_PASSWORD tidak ditemukan. Periksa konfigurasi .env.test'
  );
}

async function cleanTestDb() {
  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'perpus_uts_test_db',
  });
  await client.connect();
  await client.query('TRUNCATE TABLE loans, books, members CASCADE');
  await client.end();
  console.log('[Setup] perpus_uts_test_db cleaned.');
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for server at ${url}`);
}

async function main() {
  console.log('=== 1. PREPARING ISOLATED TEST ENVIRONMENT ===');
  await cleanTestDb();

  console.log('=== 2. STARTING ISOLATED NESTJS APP ON PORT 3001 ===');
  const serverProcess = spawn('node', ['dist/main.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3001',
      DB_NAME: 'perpus_uts_test_db',
    },
    stdio: 'inherit',
    shell: true,
  });

  try {
    await waitForServer('http://localhost:3001/api/v1/dashboard/summary');
    console.log('[Ready] Test server is listening at http://localhost:3001/api/v1');

    console.log('\n=== 3. RUNNING NEWMAN TEST SUITE ===');
    await new Promise((resolve, reject) => {
      const newman = spawn(
        'npx',
        [
          'newman',
          'run',
          'postman/perpus_uts_api.postman_collection.json',
          '--env-var',
          'baseUrl=http://localhost:3001/api/v1',
          '--reporters',
          'cli',
        ],
        { stdio: 'inherit', shell: true }
      );

      newman.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Newman exited with code ${code}`));
      });
    });
    console.log('[Newman] All tests passed successfully!');
  } finally {
    console.log('\n=== 4. TEARDOWN: STOPPING SERVER & CLEANING TEST DB ===');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { stdio: 'ignore' });
    } else {
      serverProcess.kill('SIGTERM');
    }
    await cleanTestDb();
  }
}

main().catch((err) => {
  console.error('[Error in Newman Runner]:', err.message);
  process.exit(1);
});
