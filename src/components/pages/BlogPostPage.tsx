
import React from 'react'
import { ArrowLeft, Clock, User, Tag } from 'lucide-react'

interface BlogPostPageProps {
  onNavigate: (page: string) => void
  postId: string
}

export default function BlogPostPage({ onNavigate, postId }: BlogPostPageProps) {
  // Mock blog posts data
  const posts = {
    '1': {
      id: '1',
      title: 'The Future of Academic Research: How AI is Transforming Scholarly Work',
      author: 'Dr. Sarah Chen',
      date: 'March 15, 2024',
      readTime: '8 min read',
      tags: ['AI', 'Research', 'Academia', 'Technology'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      content: `
        <p class="text-lg text-gray-700 mb-6">Artificial Intelligence is revolutionizing the way we conduct academic research, from literature reviews to data analysis and hypothesis generation. This transformation is not just changing how we work—it's expanding what's possible in scholarly investigation.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">The Current Landscape</h2>
        <p class="text-gray-700 mb-6">Traditional research methods, while thorough, often require extensive manual effort for tasks like literature review, data collection, and pattern recognition. Researchers spend countless hours sifting through papers, organizing findings, and identifying connections between disparate pieces of information.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">AI-Powered Research Tools</h2>
        <p class="text-gray-700 mb-4">Modern AI tools are addressing these challenges by:</p>
        <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Automatically summarizing research papers and extracting key findings</li>
          <li>Identifying patterns in large datasets that might be missed by human analysis</li>
          <li>Suggesting relevant papers and resources based on research context</li>
          <li>Generating hypotheses based on existing literature</li>
          <li>Facilitating cross-disciplinary connections and insights</li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Real-World Applications</h2>
        <p class="text-gray-700 mb-6">Researchers across various fields are already leveraging AI to accelerate their work. In medical research, AI helps identify potential drug compounds and predict treatment outcomes. In social sciences, natural language processing reveals patterns in large text corpora. In environmental science, machine learning models predict climate patterns and ecosystem changes.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Challenges and Considerations</h2>
        <p class="text-gray-700 mb-6">While AI offers tremendous potential, researchers must also navigate challenges such as data privacy, algorithmic bias, and the need for human oversight in AI-generated insights. The key is finding the right balance between automation and human expertise.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">The Future</h2>
        <p class="text-gray-700 mb-6">As AI continues to evolve, we can expect even more sophisticated tools that will further streamline the research process. The future likely holds AI assistants that can conduct preliminary research, generate initial drafts, and even suggest novel research directions based on emerging trends and gaps in the literature.</p>

        <p class="text-gray-700">The integration of AI in academic research is not about replacing human researchers—it's about augmenting human capabilities and freeing researchers to focus on higher-level thinking, creativity, and innovation.</p>
      `
    },
    '2': {
      id: '2',
      title: 'Effective Citation Management: Best Practices for Modern Researchers',
      author: 'Prof. Michael Rodriguez',
      date: 'March 10, 2024',
      readTime: '6 min read',
      tags: ['Citations', 'Research Methods', 'Academic Writing'],
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
      content: `
        <p class="text-lg text-gray-700 mb-6">Proper citation management is crucial for academic integrity and research efficiency. This guide explores best practices for organizing, formatting, and utilizing citations in your research workflow.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Why Citation Management Matters</h2>
        <p class="text-gray-700 mb-6">Effective citation management saves time, ensures accuracy, and helps maintain academic integrity. It also facilitates collaboration and makes your research more discoverable and verifiable.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Start organizing citations from day one of your research</li>
          <li>Use consistent formatting across all your references</li>
          <li>Include all necessary metadata for each source</li>
          <li>Regularly backup your citation database</li>
          <li>Tag and categorize citations for easy retrieval</li>
        </ul>

        <p class="text-gray-700">Modern citation management tools can automate much of this process, making it easier to maintain organized, properly formatted bibliographies throughout your research career.</p>
      `
    },
    '3': {
      id: '3',
      title: 'Collaborative Research in the Digital Age: Tools and Strategies',
      author: 'Dr. Emily Watson',
      date: 'March 5, 2024',
      readTime: '7 min read',
      tags: ['Collaboration', 'Digital Tools', 'Team Research'],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      content: `
        <p class="text-lg text-gray-700 mb-6">Digital collaboration tools have transformed how research teams work together, enabling seamless cooperation across geographic and institutional boundaries.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">The Evolution of Research Collaboration</h2>
        <p class="text-gray-700 mb-6">Traditional research collaboration often involved lengthy email chains, version control issues, and coordination challenges. Today's digital tools enable real-time collaboration, transparent progress tracking, and efficient knowledge sharing.</p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Key Features of Effective Collaboration Platforms</h2>
        <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>Real-time document editing and commenting</li>
          <li>Version control and change tracking</li>
          <li>Integrated communication tools</li>
          <li>File sharing and storage</li>
          <li>Project management capabilities</li>
        </ul>

        <p class="text-gray-700">The future of research collaboration lies in platforms that seamlessly integrate these features while maintaining the security and privacy requirements of academic research.</p>
      `
    }
  }

  const post = posts[postId as keyof typeof posts]

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <button
            onClick={() => onNavigate('blog')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => onNavigate('blog')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Featured Image */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
          
          {/* Content */}
          <div className="p-8">
            {/* Meta Info */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </div>
              </div>
              <span>{post.date}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex items-center mb-8">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share/Action Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Published on {post.date}
                </div>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Share Article
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(posts)
              .filter(p => p.id !== postId)
              .slice(0, 2)
              .map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate(`blog-post-${relatedPost.id}`)}
                >
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{relatedPost.author}</span>
                      <span className="mx-2">•</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </article>
    </div>
  )
}
