import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { users, papers, journals, quests, achievements, communities, learningPaths } from '../shared/schema';

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

    // Seed communities
    const communityData = [
      {
        name: 'AI & Machine Learning',
        description: 'Discuss latest developments in artificial intelligence and machine learning research.',
        category: 'Technology',
        memberCount: 1240
      },
      {
        name: 'Climate Science',
        description: 'Community for researchers working on climate change and environmental science.',
        category: 'Environment',
        memberCount: 890
      },
      {
        name: 'Quantum Computing',
        description: 'Explore quantum computing research, algorithms, and applications.',
        category: 'Technology',
        memberCount: 567
      },
      {
        name: 'Medical Research',
        description: 'Share and discuss medical research findings and methodologies.',
        category: 'Medicine',
        memberCount: 2100
      }
    ];

    for (const community of communityData) {
      try {
        await db.insert(communities).values(community);
        console.log(`Created community: ${community.name}`);
      } catch (error) {
        console.log(`Community ${community.name} already exists`);
      }
    }

    // Seed learning paths
    const learningPathData = [
      {
        title: 'Introduction to Research Methods',
        description: 'Learn the fundamentals of scientific research methodology.',
        difficulty: 'Beginner',
        estimatedHours: 20,
        steps: [
          { id: 'step1', title: 'Understanding Research Questions', description: 'Learn how to formulate effective research questions' },
          { id: 'step2', title: 'Literature Review Techniques', description: 'Master the art of comprehensive literature reviews' },
          { id: 'step3', title: 'Data Collection Methods', description: 'Explore various data collection approaches' }
        ]
      },
      {
        title: 'Advanced Statistical Analysis',
        description: 'Master statistical techniques for research data analysis.',
        difficulty: 'Advanced',
        estimatedHours: 40,
        steps: [
          { id: 'step1', title: 'Descriptive Statistics', description: 'Understanding data distribution and summary statistics' },
          { id: 'step2', title: 'Inferential Statistics', description: 'Hypothesis testing and confidence intervals' },
          { id: 'step3', title: 'Advanced Modeling', description: 'Regression analysis and machine learning basics' }
        ]
      }
    ];

    for (const path of learningPathData) {
      try {
        await db.insert(learningPaths).values(path);
        console.log(`Created learning path: ${path.title}`);
      } catch (error) {
        console.log(`Learning path ${path.title} already exists`);
      }
    }

    // Seed research tools
    const researchToolsData = [
      {
        name: 'Citation Manager',
        description: 'Organize and format your citations effortlessly',
        category: 'Writing',
        icon: '📚'
      },
      {
        name: 'Statistical Analysis',
        description: 'Perform advanced statistical analysis on your data',
        category: 'Analysis',
        icon: '📊'
      },
      {
        name: 'Literature Search',
        description: 'Comprehensive search across academic databases',
        category: 'Discovery',
        icon: '🔍'
      },
      {
        name: 'Collaboration Hub',
        description: 'Connect with researchers and collaborate on projects',
        category: 'Collaboration',
        icon: '🤝'
      },
      {
        name: 'Visual Abstract Creator',
        description: 'Create compelling visual abstracts for your papers',
        category: 'Presentation',
        icon: '🎨'
      }
    ];

    for (const tool of researchToolsData) {
      try {
        await db.insert(researchTools).values(tool);
        console.log(`Created research tool: ${tool.name}`);
      } catch (error) {
        console.log(`Research tool ${tool.name} already exists`);
      }
    }

    // Seed trending topics
    const trendingData = [
      {
        topic: 'Machine Learning',
        field: 'Computer Science',
        momentumScore: '95.5',
        paperCount: 1250
      },
      {
        topic: 'Climate Change',
        field: 'Environmental Science',
        momentumScore: '92.3',
        paperCount: 890
      },
      {
        topic: 'Gene Therapy',
        field: 'Biotechnology',
        momentumScore: '89.7',
        paperCount: 567
      },
      {
        topic: 'Quantum Computing',
        field: 'Physics',
        momentumScore: '87.2',
        paperCount: 423
      }
    ];

    for (const trend of trendingData) {
      try {
        await db.insert(trendingTopics).values(trend);
        console.log(`Created trending topic: ${trend.topic}`);
      } catch (error) {
        console.log(`Trending topic ${trend.topic} already exists`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();