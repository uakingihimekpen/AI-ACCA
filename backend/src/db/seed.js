const bcrypt = require('bcryptjs');
const { pool } = require('./pool');
require('dotenv').config();

async function seed() {
  const client = await pool.connect();
  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@accaapp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, 'admin') 
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', adminEmail, hashedPassword]
    );

    console.log('✅ Seed data inserted successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();