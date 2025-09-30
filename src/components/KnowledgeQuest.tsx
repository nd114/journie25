
import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Users, 
  Zap, 
  Award,
  TrendingUp,
  CheckCircle,
  Lock
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: number;
  category: 'reading' | 'discussing' | 'discovering' | 'sharing';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  unlocked: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const KnowledgeQuest: React.FC = () => {
  const [userLevel, setUserLevel] = useState(5);
  const [userXP, setUserXP] = useState(750);
  const [nextLevelXP] = useState(1000);
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');

  const quests: Quest[] = [
    {
      id: 'first-steps',
      title: 'Research Explorer',
      description: 'Read 5 research papers to get familiar with the platform',
      progress: 3,
      maxProgress: 5,
      reward: 100,
      category: 'reading',
      difficulty: 'easy',
      completed: false,
      unlocked: true
    },
    {
      id: 'field-hopper',
      title: 'Cross-Field Navigator',
      description: 'Explore papers from 3 different research fields',
      progress: 2,
      maxProgress: 3,
      reward: 150,
      category: 'discovering',
      difficulty: 'medium',
      completed: false,
      unlocked: true
    },
    {
      id: 'discussion-starter',
      title: 'Community Contributor',
      description: 'Start meaningful discussions by commenting on 10 papers',
      progress: 4,
      maxProgress: 10,
      reward: 200,
      category: 'discussing',
      difficulty: 'medium',
      completed: false,
      unlocked: true
    },
    {
      id: 'trending-hunter',
      title: 'Trend Spotter',
      description: 'Be among the first 50 readers of 5 trending papers',
      progress: 1,
      maxProgress: 5,
      reward: 300,
      category: 'discovering',
      difficulty: 'hard',
      completed: false,
      unlocked: false
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Read a paper within 24 hours of publication',
      icon: '🌅',
      earned: true,
      rarity: 'common'
    },
    {
      id: 'knowledge-seeker',
      title: 'Knowledge Seeker',
      description: 'Read 50 research papers',
      icon: '📚',
      earned: false,
      rarity: 'rare'
    },
    {
      id: 'field-master',
      title: 'Field Master',
      description: 'Become an expert in a specific research field',
      icon: '🎓',
      earned: false,
      rarity: 'epic'
    },
    {
      id: 'research-legend',
      title: 'Research Legend',
      description: 'Complete all available quests',
      icon: '🏆',
      earned: false,
      rarity: 'legendary'
    }
  ];

  const getCategoryIcon = (category: Quest['category']) => {
    switch (category) {
      case 'reading': return BookOpen;
      case 'discussing': return Users;
      case 'discovering': return Target;
      case 'sharing': return TrendingUp;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userLevel}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Knowledge Quest</h2>
              <p className="text-gray-600">Level {userLevel} Research Explorer</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">XP Progress</div>
            <div className="font-bold text-gray-900">{userXP}/{nextLevelXP}</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(userXP / nextLevelXP) * 100}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'quests', label: 'Active Quests', icon: Target },
          { key: 'achievements', label: 'Achievements', icon: Trophy }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all flex-1 justify-center ${
              activeTab === key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          {quests.map((quest) => {
            const CategoryIcon = getCategoryIcon(quest.category);
            const progressPercent = (quest.progress / quest.maxProgress) * 100;

            return (
              <div 
                key={quest.id} 
                className={`border rounded-lg p-4 transition-all ${
                  quest.unlocked 
                    ? 'border-gray-200 hover:border-indigo-300 hover:shadow-md' 
                    : 'border-gray-100 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      quest.unlocked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {quest.unlocked ? <CategoryIcon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{quest.title}</h3>
                      <p className="text-gray-600 text-sm">{quest.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-yellow-600">
                      <Star className="w-3 h-3" />
                      <span className="text-xs font-medium">{quest.reward} XP</span>
                    </div>
                  </div>
                </div>

                {quest.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{quest.progress}/{quest.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                achievement.earned 
                  ? getRarityColor(achievement.rarity) + ' transform hover:scale-105'
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  {achievement.earned ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Earned</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Locked</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
