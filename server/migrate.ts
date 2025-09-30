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
        topic TEXT NOT NULL,
        field TEXT,
        momentum_score DECIMAL(5,2) DEFAULT 0.0,
        paper_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create Phase 3 gamification tables
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_active_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS quests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        max_progress INTEGER NOT NULL,
        reward_xp INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_quest_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quest_id INTEGER REFERENCES quests(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        started_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        rarity TEXT NOT NULL,
        condition JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS visual_abstracts (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        elements JSONB DEFAULT '[]',
        canvas_style JSONB DEFAULT '{}',
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS multi_level_content (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        level TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        examples JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS research_timelines (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        paper_ids JSONB DEFAULT '[]',
        milestones JSONB DEFAULT '[]',
        is_public BOOLEAN DEFAULT false,
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