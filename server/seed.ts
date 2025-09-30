
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { users, papers, journals, quests, achievements } from '../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Create sample journal
    const sampleJournal = await db.insert(journals).values({
      name: 'Nature Research',
      slug: 'nature-research',
      description: 'Leading scientific journal',
      issn: '0028-0836'
    }).returning();

    // Create sample user
    const sampleUser = await db.insert(users).values({
      email: 'demo@example.com',
      password: 'hashed_password',
      name: 'Demo User',
      affiliation: 'Demo University',
      bio: 'Passionate researcher'
    }).returning();

    // Create sample papers
    const samplePapers = [
      {
        title: 'Advances in Machine Learning for Climate Prediction',
        abstract: 'This paper presents novel approaches to using machine learning algorithms for improving climate prediction models.',
        content: 'Full paper content here...',
        authors: ['Dr. Jane Smith', 'Dr. John Doe'],
        researchField: 'Climate Science',
        keywords: ['machine learning', 'climate', 'prediction'],
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
        journalId: sampleJournal[0].id,
        createdBy: sampleUser[0].id,
        viewCount: 150,
        engagementScore: 85
      },
      {
        title: 'Quantum Computing Applications in Drug Discovery',
        abstract: 'Exploring how quantum computing can accelerate pharmaceutical research and drug development.',
        content: 'Full paper content here...',
        authors: ['Dr. Alice Johnson', 'Dr. Bob Wilson'],
        researchField: 'Quantum Physics',
        keywords: ['quantum computing', 'drug discovery', 'pharmaceuticals'],
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
        journalId: sampleJournal[0].id,
        createdBy: sampleUser[0].id,
        viewCount: 200,
        engagementScore: 92
      }
    ];

    await db.insert(papers).values(samplePapers);

    // Create sample quests
    const sampleQuests = [
      {
        title: 'First Steps Explorer',
        description: 'Read your first research paper',
        category: 'reading',
        difficulty: 'easy',
        maxProgress: 1,
        rewardXP: 50
      },
      {
        title: 'Discussion Starter',
        description: 'Leave your first comment on a paper',
        category: 'discussing',
        difficulty: 'easy',
        maxProgress: 1,
        rewardXP: 30
      },
      {
        title: 'Field Explorer',
        description: 'Explore papers from 3 different research fields',
        category: 'discovering',
        difficulty: 'medium',
        maxProgress: 3,
        rewardXP: 100
      }
    ];

    await db.insert(quests).values(sampleQuests);

    // Create sample achievements
    const sampleAchievements = [
      {
        title: 'First Reader',
        description: 'Read your first research paper',
        icon: '📖',
        rarity: 'common',
        condition: { type: 'papers_read', count: 1 }
      },
      {
        title: 'Knowledge Seeker',
        description: 'Read 10 research papers',
        icon: '🎓',
        rarity: 'rare',
        condition: { type: 'papers_read', count: 10 }
      },
      {
        title: 'Discussion Master',
        description: 'Start 5 meaningful discussions',
        icon: '💬',
        rarity: 'epic',
        condition: { type: 'comments_created', count: 5 }
      }
    ];

    await db.insert(achievements).values(sampleAchievements);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
