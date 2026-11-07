import { spawn } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

console.log('=== STARTING TEST SERVER ON PORT 3001 (CONNECTED TO perpus_uts_test_db) ===');
console.log('Base URL: http://localhost:3001/api/v1');
console.log('Swagger UI: http://localhost:3001/api/docs');
console.log('Target Database: perpus_uts_test_db (Terisolasi dari perpus_uts_db)');
console.log('Tekan Ctrl+C untuk menghentikan server.\n');

const child = spawn('node', ['dist/main.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '3001',
    DB_NAME: 'perpus_uts_test_db',
  },
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', child.pid, '/f', '/t'], { stdio: 'ignore' });
  } else {
    child.kill('SIGINT');
  }
  process.exit();
});
