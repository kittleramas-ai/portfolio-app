import mysql from 'mysql2/promise'
import { config } from 'dotenv'

// Load .env.local and .env
config({ path: '.env.local' })
config({ path: '.env' })

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URI

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL is not set in environment or .env.local')
  process.exit(1)
}

async function run() {
  console.log('🔄 Connecting to MySQL...')
  const connection = await mysql.createConnection({
    uri: databaseUrl,
    multipleStatements: true,
  })

  try {
    console.log('✅ Connected successfully.')

    // 1. Create table chatbot_enquiry if it does not exist
    console.log('👉 Creating table `chatbot_enquiry` (if not exists)...')
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`chatbot_enquiry\` (
        \`id\` varchar(36) NOT NULL,
        \`first_name\` varchar(120) NOT NULL,
        \`last_name\` varchar(120) DEFAULT NULL,
        \`email\` varchar(250) NOT NULL,
        \`phone_or_company\` varchar(160) DEFAULT NULL,
        \`message\` mediumtext NOT NULL,
        \`appointment_requested\` tinyint(1) NOT NULL DEFAULT 0,
        \`is_read\` int(11) NOT NULL DEFAULT 0,
        \`ip_address\` varchar(64) DEFAULT NULL,
        \`user_agent\` varchar(512) DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    console.log('✅ Table `chatbot_enquiry` is verified.')

    // 2. Ensure columns and index exist
    console.log('👉 Verifying columns and indexes...')
    const [indexes] = await connection.query(`
      SHOW INDEX FROM \`chatbot_enquiry\` WHERE Key_name = 'chatbot_enquiry_appointment_idx';
    `)

    if (Array.isArray(indexes) && indexes.length === 0) {
      console.log('👉 Adding index `chatbot_enquiry_appointment_idx`...')
      await connection.query(`
        ALTER TABLE \`chatbot_enquiry\`
        ADD INDEX \`chatbot_enquiry_appointment_idx\` (\`appointment_requested\`);
      `)
      console.log('✅ Index added.')
    } else {
      console.log('ℹ️ Index `chatbot_enquiry_appointment_idx` already exists.')
    }

    // 3. Test insert & delete to verify permissions and syntax
    console.log('👉 Performing test insert...')
    const testId = 'test-' + Date.now()
    await connection.query(
      `
      INSERT INTO \`chatbot_enquiry\` (
        \`id\`, \`first_name\`, \`last_name\`, \`email\`, \`phone_or_company\`, \`message\`, \`appointment_requested\`, \`is_read\`, \`ip_address\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        testId,
        'Test',
        'Verification',
        'test@test.local',
        '+919999999999',
        'DB connection test',
        1,
        0,
        '127.0.0.1',
      ],
    )

    await connection.query(
      'DELETE FROM `chatbot_enquiry` WHERE `id` = ?',
      [testId],
    )
    console.log('✅ Test query succeeded and cleaned up!')

    console.log('\n🎉 ALL DATABASE CHECKS & QUERIES PASSED!')
  } catch (err) {
    console.error('❌ Migration / Alter error:', err)
  } finally {
    await connection.end()
  }
}

run()
