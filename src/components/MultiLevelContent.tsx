import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  Microscope,
  ArrowUpDown,
  Lightbulb,
  BookOpen,
  Zap,
} from "lucide-react";

interface MultiLevelContentProps {
  paper: {
    id: number;
    title: string;
    abstract: string;
    content: string;
    field?: string;
    storyData?: {
      general?: string;
      intermediate?: string;
      expert?: string;
    };
  };
}

export const MultiLevelContent: React.FC<MultiLevelContentProps> = ({
  paper,
}) => {
  const [currentLevel, setCurrentLevel] = useState<
    "general" | "intermediate" | "expert"
  >("general");

  const levels = [
    {
      key: "general" as const,
      label: "General Audience",
      icon: Users,
      color: "bg-green-100 text-green-700",
      description: "Easy to understand for everyone",
    },
    {
      key: "intermediate" as const,
      label: "Academic",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-700",
      description: "For students and educated readers",
    },
    {
      key: "expert" as const,
      label: "Expert",
      icon: Microscope,
      color: "bg-purple-100 text-purple-700",
      description: "Full technical detail",
    },
  ];

  const generateGeneralSummary = (abstract: string) => {
    const sentences = abstract.split(".").filter((s) => s.trim().length > 20);
    return sentences.length > 0
      ? `Scientists discovered something important: ${sentences[0]}. This could help us in everyday life by making things better and solving problems we face.`
      : "This research explores important questions that could benefit our daily lives.";
  };

  const generateIntermediateSummary = (abstract: string) => {
    return abstract.replace(/\b(methodology|paradigm|efficacy)\b/g, (match) => {
      const explanations = {
        methodology: "research method",
        paradigm: "approach or model",
        efficacy: "effectiveness",
      };
      return explanations[match as keyof typeof explanations] || match;
    });
  };

  const getContentForLevel = () => {
    const hasStoryData = paper.storyData && (
      paper.storyData.general || 
      paper.storyData.intermediate || 
      paper.storyData.expert
    );

    switch (currentLevel) {
      case "general":
        return {
          title: `What This Research Means for You`,
          content: hasStoryData && paper.storyData?.general
            ? paper.storyData.general
            : generateGeneralSummary(paper.abstract),
          examples: hasStoryData && paper.storyData?.general ? [] : [
            "Imagine if this technology was in your smartphone...",
            "This could help doctors treat patients better",
            "This might make everyday tasks easier and faster",
          ],
        };
      case "intermediate":
        return {
          title: `Academic Summary`,
          content: hasStoryData && paper.storyData?.intermediate
            ? paper.storyData.intermediate
            : generateIntermediateSummary(paper.abstract),
          examples: hasStoryData && paper.storyData?.intermediate ? [] : [
            "Key methodology: Advanced research techniques",
            "Potential applications in the field",
            "Comparison with existing research approaches",
          ],
        };
      case "expert":
        return {
          title: `Technical Abstract`,
          content: hasStoryData && paper.storyData?.expert
            ? paper.storyData.expert
            : paper.abstract,
          examples: [],
        };
    }
  };

  const contentData = getContentForLevel();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-6">
        <ArrowUpDown className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Choose Your Reading Level
        </h2>
      </div>

      {/* Level Selector */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        {levels.map((level) => {
          const Icon = level.icon;
          return (
            <button
              key={level.key}
              onClick={() => setCurrentLevel(level.key)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                currentLevel === level.key
                  ? level.color + " border-2 border-current"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{level.label}</div>
                <div className="text-xs opacity-80 hidden sm:block">{level.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reading Progress */}
      <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Reading Progress: {currentLevel === 'general' ? '33%' : currentLevel === 'intermediate' ? '66%' : '100%'}
          </span>
        </div>
        <div className="w-24 bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: currentLevel === 'general' ? '33%' : currentLevel === 'intermediate' ? '66%' : '100%'
            }}
          ></div>
        </div>
      </div>

      {/* Content Display with smooth transition */}
      <div className="space-y-4 transition-opacity duration-300">
        <h3 className="text-lg font-semibold text-gray-900">
          {contentData.title}
        </h3>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{contentData.content}</p>
        </div>

        {/* Interactive Examples */}
        {contentData.examples.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700">
                Real-World Examples
              </span>
            </div>
            {contentData.examples.map((example, index) => (
              <div
                key={index}
                className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-300"
              >
                <p className="text-gray-700">{example}</p>
              </div>
            ))}
          </div>
        )}

        {/* Connect the Dots */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-900">
              Connect the Dots
            </span>
          </div>
          <p className="text-indigo-800 text-sm">
            This research builds on previous work in {paper.field || "this area"} and could
            lead to breakthroughs in related fields like artificial
            intelligence, healthcare, and technology development.
          </p>
        </div>

        {/* Additional Reading */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Want to Learn More?
            </span>
          </div>
          <p className="text-blue-800 text-sm">
            {currentLevel === 'general' 
              ? 'Try the Academic level to dive deeper into the methodology and findings.'
              : currentLevel === 'intermediate'
              ? 'Explore the Expert level for full technical details and implications.'
              : 'Check out the references and citations to understand the broader research context.'}
          </p>
        </div>
      </div>
    </div>
  );
};