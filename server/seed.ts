
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { users, papers, journals, quests, achievements, communities, learningPaths, researchTools, trendingTopics } from '../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Sample user data
const sampleUsers = [
  {
    email: 'dr.sarah.chen@stanford.edu',
    password: 'hashed_password',
    name: 'Dr. Sarah Chen',
    affiliation: 'Stanford University',
    bio: 'AI researcher specializing in machine learning applications in healthcare'
  },
  {
    email: 'prof.james.wright@mit.edu', 
    password: 'hashed_password',
    name: 'Prof. James Wright',
    affiliation: 'MIT',
    bio: 'Climate scientist focused on atmospheric modeling and prediction'
  },
  {
    email: 'dr.maria.garcia@caltech.edu',
    password: 'hashed_password',
    name: 'Dr. Maria Garcia',
    affiliation: 'Caltech',
    bio: 'Quantum physicist working on quantum computing applications'
  },
  {
    email: 'dr.alex.kim@harvard.edu',
    password: 'hashed_password',
    name: 'Dr. Alex Kim',
    affiliation: 'Harvard University',
    bio: 'Neuroscientist researching brain-computer interfaces'
  },
  {
    email: 'prof.lisa.anderson@berkeley.edu',
    password: 'hashed_password',
    name: 'Prof. Lisa Anderson',
    affiliation: 'UC Berkeley',
    bio: 'Biotechnology researcher developing gene therapy solutions'
  },
  {
    email: 'dr.michael.brown@oxford.edu',
    password: 'hashed_password',
    name: 'Dr. Michael Brown',
    affiliation: 'Oxford University',
    bio: 'Space physicist studying exoplanet atmospheres'
  },
  {
    email: 'dr.emma.taylor@cambridge.edu',
    password: 'hashed_password',
    name: 'Dr. Emma Taylor',
    affiliation: 'Cambridge University',
    bio: 'Computer scientist developing next-generation algorithms'
  },
  {
    email: 'prof.david.wilson@cern.ch',
    password: 'hashed_password',
    name: 'Prof. David Wilson',
    affiliation: 'CERN',
    bio: 'Particle physicist working on the Large Hadron Collider'
  },
  {
    email: 'dr.rachel.lee@nasa.gov',
    password: 'hashed_password',
    name: 'Dr. Rachel Lee',
    affiliation: 'NASA',
    bio: 'Astrobiologist searching for signs of life in the universe'
  },
  {
    email: 'dr.thomas.mueller@mpg.de',
    password: 'hashed_password',
    name: 'Dr. Thomas Mueller',
    affiliation: 'Max Planck Institute',
    bio: 'Materials scientist developing sustainable energy solutions'
  }
];

// Comprehensive paper data
const samplePapers = [
  {
    title: 'Neural Networks for Climate Pattern Recognition: A Deep Learning Approach',
    abstract: 'This study presents a novel deep learning framework for identifying complex climate patterns in satellite data. Our approach combines convolutional neural networks with recurrent layers to capture both spatial and temporal dependencies in atmospheric measurements. Results show 94% accuracy in predicting severe weather events 48 hours in advance.',
    content: 'Climate prediction has long been one of the most challenging problems in atmospheric science. Traditional models rely on complex mathematical equations that describe atmospheric dynamics, but these models often struggle with the chaotic nature of weather systems and the vast amount of observational data available from satellites and ground stations.\n\nOur research introduces a revolutionary approach using deep neural networks specifically designed for climate data analysis. The architecture consists of three main components: a convolutional neural network for spatial feature extraction, a long short-term memory (LSTM) network for temporal sequence modeling, and a attention mechanism that helps the model focus on the most relevant atmospheric features.\n\nThe dataset used in this study comprises 15 years of satellite observations from multiple sources, including temperature profiles, humidity measurements, wind speeds, and pressure readings. We preprocessed this data using advanced normalization techniques and created a comprehensive training set of over 2 million data points.\n\nOur results demonstrate significant improvements over existing methods. The model achieves 94% accuracy in predicting severe weather events such as hurricanes, tornadoes, and severe thunderstorms up to 48 hours in advance. This represents a 23% improvement over current operational forecasting systems.\n\nThe implications of this research extend beyond weather prediction. The same techniques could be applied to climate change modeling, helping scientists better understand long-term trends and their potential impacts on global ecosystems.',
    authors: ['Dr. Sarah Chen', 'Prof. James Wright', 'Dr. Michael Brown'],
    researchField: 'Climate Science',
    keywords: ['machine learning', 'climate prediction', 'neural networks', 'weather forecasting'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-01-15'),
    viewCount: 2847,
    engagementScore: 92
  },
  {
    title: 'Quantum Error Correction in Superconducting Qubits: Breaking the Threshold',
    abstract: 'We demonstrate a breakthrough in quantum error correction using a novel approach with superconducting qubits. Our method achieves error rates below the threshold required for fault-tolerant quantum computing, marking a crucial milestone toward practical quantum computers.',
    content: 'Quantum computing promises to revolutionize fields from cryptography to drug discovery, but one major obstacle has been the fragile nature of quantum information. Quantum bits, or qubits, are extremely sensitive to environmental noise, leading to errors that accumulate rapidly and destroy quantum computations.\n\nQuantum error correction addresses this challenge by encoding logical qubits in multiple physical qubits and using sophisticated algorithms to detect and correct errors. However, achieving the error rates necessary for fault-tolerant quantum computing has remained elusive.\n\nOur research presents a new quantum error correction code specifically designed for superconducting qubit architectures. The code uses a innovative approach called "active error correction" that continuously monitors the quantum state and applies corrections in real-time.\n\nWe implemented this system on a 72-qubit superconducting processor, achieving logical error rates of 0.01% per operation - well below the theoretical threshold of 1% required for fault-tolerant quantum computing. This represents a 50-fold improvement over previous demonstrations.\n\nThe key innovation is our "adaptive threshold" algorithm that adjusts correction strategies based on the real-time analysis of error patterns. This allows the system to maintain high fidelity even as individual qubit performance varies over time.\n\nThese results bring us significantly closer to practical quantum computers capable of solving problems beyond the reach of classical computers.',
    authors: ['Dr. Maria Garcia', 'Dr. Thomas Mueller'],
    researchField: 'Quantum Physics',
    keywords: ['quantum computing', 'error correction', 'superconducting qubits', 'fault tolerance'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-01-20'),
    viewCount: 1923,
    engagementScore: 88
  },
  {
    title: 'CRISPR 3.0: Precision Gene Editing with Minimal Off-Target Effects',
    abstract: 'We present CRISPR 3.0, a revolutionary gene editing system that achieves unprecedented precision with less than 0.1% off-target effects. This breakthrough enables safe therapeutic applications for treating genetic disorders previously considered incurable.',
    content: 'Gene editing has transformed biological research and holds enormous promise for treating genetic diseases. However, existing CRISPR systems suffer from off-target effects - unintended modifications to DNA that could cause harmful mutations.\n\nCRISPR 3.0 addresses this limitation through several key innovations. First, we developed enhanced guide RNAs with improved specificity through computational design and machine learning optimization. Second, we created a new Cas protein variant with reduced off-target binding affinity.\n\nOur system was tested in human cell cultures for treating sickle cell disease, cystic fibrosis, and Huntington\'s disease. In all cases, CRISPR 3.0 achieved therapeutic levels of gene correction with off-target rates below 0.1% - a 100-fold improvement over current methods.\n\nParticularly exciting is our success in treating Huntington\'s disease, where we selectively disabled the mutant huntingtin gene while leaving the normal copy intact. This precision was previously impossible with existing gene editing tools.\n\nClinical trials are planned to begin next year for sickle cell disease, representing a major step toward curing genetic disorders that affect millions worldwide.',
    authors: ['Prof. Lisa Anderson', 'Dr. Emma Taylor'],
    researchField: 'Biotechnology',
    keywords: ['CRISPR', 'gene editing', 'genetic disorders', 'therapeutic applications'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-01-25'),
    viewCount: 3156,
    engagementScore: 95
  },
  {
    title: 'Brain-Computer Interfaces: Decoding Motor Intentions from Neural Signals',
    abstract: 'Our research demonstrates a breakthrough in brain-computer interface technology, enabling paralyzed patients to control robotic limbs with unprecedented precision through advanced neural signal decoding algorithms.',
    content: 'Brain-computer interfaces (BCIs) offer hope for restoring mobility to individuals with spinal cord injuries or neurodegenerative diseases. However, decoding motor intentions from neural signals remains challenging due to signal noise and the complexity of neural activity patterns.\n\nWe developed a new machine learning approach that combines deep neural networks with advanced signal processing to decode motor intentions from brain signals with 97% accuracy. The system was tested with five patients with spinal cord injuries.\n\nOur algorithm uses a novel attention mechanism that focuses on the most relevant neural features for specific movements. This allows the system to adapt to each patient\'s unique neural patterns and maintain performance over time.\n\nIn clinical trials, patients were able to control a robotic arm to perform complex tasks such as picking up objects, writing, and even playing simple games. The system learned to interpret not just intended movements but also the desired speed and force.\n\nThis research brings us closer to practical brain-computer interfaces that could restore independence to millions of people with paralysis.',
    authors: ['Dr. Alex Kim', 'Dr. Sarah Chen'],
    researchField: 'Neuroscience',
    keywords: ['brain-computer interface', 'neural decoding', 'paralysis', 'machine learning'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-01'),
    viewCount: 2134,
    engagementScore: 89
  },
  {
    title: 'Exoplanet Atmospheric Composition: Biosignatures in the TRAPPIST-1 System',
    abstract: 'Spectroscopic analysis of the TRAPPIST-1 exoplanets reveals compelling evidence of atmospheric water vapor and potential biosignatures, marking a significant step forward in the search for extraterrestrial life.',
    content: 'The search for life beyond Earth has focused on finding planets in the "habitable zone" where liquid water could exist. The TRAPPIST-1 system, with seven Earth-sized planets, represents one of the most promising targets for this search.\n\nUsing advanced spectroscopic techniques with the James Webb Space Telescope, we analyzed the atmospheric composition of three TRAPPIST-1 planets: e, f, and g. Our observations span multiple transits over 18 months, providing unprecedented detail about these distant worlds.\n\nOur most significant finding is the detection of water vapor in the atmospheres of all three planets, with concentrations suggesting the possible presence of surface oceans. Additionally, we identified trace amounts of oxygen and methane in TRAPPIST-1e\'s atmosphere - a combination that on Earth is maintained only by biological processes.\n\nWhile we cannot definitively conclude that life exists on these planets, the atmospheric composition is consistent with biological activity. The oxygen-methane combination is particularly intriguing because these gases react with each other and disappear quickly unless continuously replenished.\n\nFuture observations will focus on detecting other potential biosignatures such as phosphine or dimethyl sulfide, which could provide stronger evidence for biological activity.',
    authors: ['Dr. Rachel Lee', 'Dr. Michael Brown'],
    researchField: 'Space Exploration',
    keywords: ['exoplanets', 'biosignatures', 'TRAPPIST-1', 'astrobiology'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-05'),
    viewCount: 4267,
    engagementScore: 97
  },
  {
    title: 'Sustainable Energy Storage: Revolutionary Solid-State Battery Technology',
    abstract: 'We present a breakthrough in solid-state battery technology achieving 500% longer life cycles and 300% higher energy density compared to lithium-ion batteries, using abundant and environmentally friendly materials.',
    content: 'Energy storage is crucial for the transition to renewable energy, but current lithium-ion batteries have limitations including limited lifespan, safety concerns, and dependence on rare materials.\n\nOur research develops solid-state batteries using a novel ceramic electrolyte made from abundant sodium and aluminum compounds. This eliminates the flammable liquid electrolytes used in conventional batteries while dramatically improving performance.\n\nThe key innovation is our nanostructured ceramic electrolyte that allows rapid ion transport while maintaining structural stability. We achieved this through precise control of the material\'s crystal structure using advanced manufacturing techniques.\n\nLaboratory tests demonstrate extraordinary performance: 10,000 charge-discharge cycles with less than 5% capacity loss, energy density of 800 Wh/kg (compared to 250 Wh/kg for lithium-ion), and complete elimination of thermal runaway risks.\n\nThe environmental benefits are equally impressive. Our batteries use no lithium, cobalt, or other rare materials. The sodium and aluminum components are among the most abundant elements on Earth and can be recycled indefinitely.\n\nCommercial production could begin within five years, potentially revolutionizing everything from electric vehicles to grid-scale energy storage.',
    authors: ['Dr. Thomas Mueller', 'Prof. Lisa Anderson'],
    researchField: 'Energy',
    keywords: ['solid-state batteries', 'energy storage', 'sustainable technology', 'renewable energy'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-10'),
    viewCount: 2876,
    engagementScore: 91
  },
  {
    title: 'Artificial Intelligence in Drug Discovery: Accelerating Pharmaceutical Development',
    abstract: 'Our AI-driven drug discovery platform reduces the time from target identification to clinical trials from 10 years to 18 months, successfully identifying three novel compounds currently in Phase II trials.',
    content: 'Traditional drug discovery is notoriously slow and expensive, taking 10-15 years and billions of dollars to bring a new drug to market. Artificial intelligence offers the potential to dramatically accelerate this process.\n\nWe developed an integrated AI platform that combines molecular simulation, machine learning, and automated synthesis to streamline drug discovery. The system can predict drug-target interactions, optimize molecular properties, and even suggest synthetic routes.\n\nOur approach starts with large-scale virtual screening of millions of compounds against target proteins. Advanced neural networks predict binding affinity, selectivity, and potential side effects. The most promising candidates are then synthesized by robotic systems and tested in automated biological assays.\n\nTo date, our platform has identified over 50 promising drug candidates across various therapeutic areas including cancer, Alzheimer\'s disease, and infectious diseases. Three compounds have advanced to Phase II clinical trials in record time.\n\nMost notably, our Alzheimer\'s drug candidate showed significant cognitive improvement in early trials, targeting a novel pathway that conventional approaches missed. This demonstrates AI\'s ability to discover entirely new therapeutic strategies.\n\nThe implications extend beyond speed and cost savings. AI can identify drug targets and mechanisms that human researchers might overlook, potentially unlocking treatments for previously incurable diseases.',
    authors: ['Dr. Emma Taylor', 'Dr. Sarah Chen'],
    researchField: 'Computer Science',
    keywords: ['artificial intelligence', 'drug discovery', 'machine learning', 'pharmaceutical research'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-15'),
    viewCount: 3422,
    engagementScore: 93
  },
  {
    title: 'Particle Physics Beyond the Standard Model: Evidence for New Fundamental Forces',
    abstract: 'Analysis of high-energy collision data from the Large Hadron Collider reveals anomalies that suggest the existence of a fifth fundamental force, potentially revolutionizing our understanding of physics.',
    content: 'The Standard Model of particle physics has been remarkably successful in describing the fundamental particles and forces that make up our universe. However, recent observations have revealed phenomena that cannot be explained by this framework.\n\nOur analysis of data from the Large Hadron Collider focuses on rare particle decay processes that show unexpected patterns. After analyzing over 100 billion particle collisions, we identified statistically significant deviations from Standard Model predictions.\n\nThe most compelling evidence comes from the decay of exotic particles called "beauty quarks." These particles decay in ways that violate theoretical expectations, suggesting the influence of an unknown force or particle.\n\nWe propose that these anomalies result from a fifth fundamental force mediated by a new type of particle we call the "X boson." This force would be extremely weak and only observable in specific high-energy interactions.\n\nIf confirmed, this discovery would represent the most significant breakthrough in fundamental physics since the discovery of the Higgs boson. It could explain mysteries such as dark matter and the matter-antimatter asymmetry in the universe.\n\nFurther experiments are planned to confirm these results and explore the properties of this potential new force.',
    authors: ['Prof. David Wilson', 'Dr. Maria Garcia'],
    researchField: 'Physics',
    keywords: ['particle physics', 'Standard Model', 'fundamental forces', 'Large Hadron Collider'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-20'),
    viewCount: 1756,
    engagementScore: 85
  },
  {
    title: 'Ocean Microplastics and Marine Ecosystem Health: A Global Assessment',
    abstract: 'Comprehensive analysis of ocean microplastic pollution reveals alarming trends threatening marine biodiversity, with concentrations increasing 200% over the past decade in critical ocean habitats.',
    content: 'Plastic pollution has become one of the most pressing environmental challenges of our time. While large plastic debris is visible and widely recognized, microplastics - particles smaller than 5mm - pose a more insidious threat to marine ecosystems.\n\nOur global survey analyzed water and sediment samples from 200 locations across all major ocean basins over a five-year period. We used advanced spectroscopic techniques to identify and quantify microplastic particles with unprecedented precision.\n\nThe results are deeply concerning. Microplastic concentrations have increased by 200% over the past decade, with the highest levels found in areas near major population centers and shipping routes. Even remote areas like the Arctic Ocean show significant contamination.\n\nMarine organisms are ingesting these particles throughout the food chain. We found microplastics in 90% of fish samples, 75% of shellfish, and even in deep-sea organisms living thousands of meters below the surface.\n\nThe biological impacts include physical damage to digestive systems, reduced fertility, and bioaccumulation of toxic chemicals that adhere to plastic particles. Entire marine food webs are being disrupted.\n\nOur research identifies specific sources of microplastic pollution and proposes targeted interventions including improved waste management, plastic alternatives, and international regulatory frameworks.',
    authors: ['Prof. James Wright', 'Dr. Rachel Lee'],
    researchField: 'Environmental Science',
    keywords: ['microplastics', 'ocean pollution', 'marine ecosystems', 'environmental conservation'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-02-25'),
    viewCount: 2145,
    engagementScore: 87
  },
  {
    title: 'Quantum Machine Learning: Hybrid Algorithms for Complex Optimization',
    abstract: 'We demonstrate quantum-enhanced machine learning algorithms that solve optimization problems exponentially faster than classical methods, with applications in logistics, finance, and scientific modeling.',
    content: 'Machine learning has revolutionized many fields, but certain optimization problems remain computationally intractable for classical computers. Quantum computing offers the potential to solve these problems exponentially faster.\n\nOur research develops hybrid quantum-classical algorithms that leverage the strengths of both computing paradigms. Classical computers handle data preprocessing and result interpretation, while quantum processors tackle the core optimization challenges.\n\nWe implemented these algorithms on IBM\'s 127-qubit quantum processor, solving portfolio optimization problems with 1000 assets - a scale previously impossible with pure quantum approaches. The quantum algorithm found optimal solutions 100 times faster than classical methods.\n\nThe key innovation is our "variational quantum eigensolver" that adaptively adjusts quantum circuit parameters to minimize cost functions. This approach is particularly effective for combinatorial optimization problems common in logistics and finance.\n\nApplications tested include supply chain optimization, drug discovery molecular design, and climate model parameter fitting. In each case, the quantum algorithms identified better solutions in significantly less time.\n\nWhile current quantum computers have limitations, our results demonstrate the near-term potential of quantum machine learning for solving real-world problems.',
    authors: ['Dr. Maria Garcia', 'Dr. Emma Taylor'],
    researchField: 'Quantum Physics',
    keywords: ['quantum computing', 'machine learning', 'optimization', 'hybrid algorithms'],
    status: 'published',
    isPublished: true,
    publishedAt: new Date('2024-03-01'),
    viewCount: 1687,
    engagementScore: 84
  }
];

async function seed() {
  console.log('Starting comprehensive database seeding...');

  try {
    // Create sample journals
    const journals = [
      {
        name: 'Nature',
        slug: 'nature',
        description: 'Leading international scientific journal',
        issn: '0028-0836'
      },
      {
        name: 'Science',
        slug: 'science',
        description: 'American Association for the Advancement of Science journal',
        issn: '0036-8075'
      },
      {
        name: 'Cell',
        slug: 'cell',
        description: 'Premier journal in life sciences',
        issn: '0092-8674'
      },
      {
        name: 'Physical Review Letters',
        slug: 'prl',
        description: 'Top physics research journal',
        issn: '0031-9007'
      }
    ];

    const createdJournals = [];
    for (const journal of journals) {
      try {
        const created = await db.insert(journals).values(journal).returning();
        createdJournals.push(created[0]);
        console.log(`Created journal: ${journal.name}`);
      } catch (error) {
        console.log(`Journal ${journal.name} already exists or error occurred`);
      }
    }

    // Create sample users
    const createdUsers = [];
    for (const user of sampleUsers) {
      try {
        const created = await db.insert(users).values(user).returning();
        createdUsers.push(created[0]);
        console.log(`Created user: ${user.name}`);
      } catch (error) {
        console.log(`User ${user.email} already exists or error occurred`);
      }
    }

    // Create sample papers
    for (let i = 0; i < samplePapers.length; i++) {
      const paper = samplePapers[i];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomJournal = createdJournals[Math.floor(Math.random() * createdJournals.length)];
      
      try {
        await db.insert(papers).values({
          ...paper,
          journalId: randomJournal?.id || 1,
          createdBy: randomUser?.id || 1
        });
        console.log(`Created paper: ${paper.title}`);
      } catch (error) {
        console.log(`Paper already exists or error occurred: ${paper.title}`);
      }
    }

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

    for (const quest of sampleQuests) {
      try {
        await db.insert(quests).values(quest);
        console.log(`Created quest: ${quest.title}`);
      } catch (error) {
        console.log(`Quest ${quest.title} already exists`);
      }
    }

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

    for (const achievement of sampleAchievements) {
      try {
        await db.insert(achievements).values(achievement);
        console.log(`Created achievement: ${achievement.title}`);
      } catch (error) {
        console.log(`Achievement ${achievement.title} already exists`);
      }
    }

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

    console.log("Comprehensive seeding completed successfully!");
    console.log(`Created ${createdUsers.length} users and ${samplePapers.length} research papers`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
