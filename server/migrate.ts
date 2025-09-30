
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Add missing columns to papers table
    await sql`
      ALTER TABLE papers 
      ADD COLUMN IF NOT EXISTS story_data JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS engagement_score DECIMAL(5,2) DEFAULT 0.0
    `;
    
    // Create paper_insights table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS paper_insights (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        insight_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create trending_topics table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS trending_topics (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(255) NOT NULL,
        field VARCHAR(100),
        momentum_score DECIMAL(5,2) DEFAULT 0.0,
        paper_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
