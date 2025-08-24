import { Pool } from 'pg';

// Extend the NodeJS.Global interface to include our custom property
declare global {
  // eslint-disable-next-line no-var
  var dbPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  if (!global.dbPool) {
    global.dbPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }
  pool = global.dbPool;
}

export default pool;
