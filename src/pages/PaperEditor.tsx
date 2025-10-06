import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Navbar from '../components/Navbar';
import { apiClient } from '../services/apiClient';

const PaperEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [authorsText, setAuthorsText] = useState('');
  const [researchField, setResearchField] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [storyDataGeneral, setStoryDataGeneral] = useState('');
  const [storyDataIntermediate, setStoryDataIntermediate] = useState('');
  const [storyDataExpert, setStoryDataExpert] = useState('');
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({
    title,
    abstract,
    content,
    authorsText,
    researchField,
    keywordsText,
    storyDataGeneral,
    storyDataIntermediate,
    storyDataExpert,
  });

  useEffect(() => {
    stateRef.current = {
      title,
      abstract,
      content,
      authorsText,
      researchField,
      keywordsText,
      storyDataGeneral,
      storyDataIntermediate,
      storyDataExpert,
    };
  }, [title, abstract, content, authorsText, researchField, keywordsText, storyDataGeneral, storyDataIntermediate, storyDataExpert]);

  useEffect(() => {
    if (id) {
      loadPaper();
    }
  }, [id]);

  const loadPaper = async () => {
    if (!id) return;
    setLoading(true);
    const response = await apiClient.getPaper(parseInt(id));
    if (response.data) {
      const paper = response.data;
      setTitle(paper.title);
      setAbstract(paper.abstract);
      setContent(paper.content || '');
      setAuthorsText(paper.authors && paper.authors.length > 0 ? paper.authors.join(', ') : '');
      setResearchField(paper.researchField || '');
      setKeywordsText(paper.keywords?.length > 0 ? paper.keywords.join(', ') : '');
      setStoryDataGeneral(paper.storyData?.general || '');
      setStoryDataIntermediate(paper.storyData?.intermediate || '');
      setStoryDataExpert(paper.storyData?.expert || '');
    }
    setLoading(false);
  };

  const handleAutoSave = useCallback(async () => {
    const { title, abstract, content, authorsText, researchField, keywordsText, storyDataGeneral, storyDataIntermediate, storyDataExpert } = stateRef.current;
    
    if (!id || !title.trim() || !abstract.trim()) return;

    setAutoSaving(true);
    setAutoSaveError(null);
    
    try {
      const authors = authorsText.split(',').map(a => a.trim()).filter(a => a);
      const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
      
      const paperData = {
        title,
        abstract,
        content,
        authors,
        researchField,
        keywords,
        status: 'draft' as const,
        storyData: {
          general: storyDataGeneral,
          intermediate: storyDataIntermediate,
          expert: storyDataExpert,
        },
      };

      const response = await apiClient.updatePaper(parseInt(id), paperData);
      
      if (response.error) {
        setAutoSaveError(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
      setAutoSaveError(errorMessage);
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 3000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [title, abstract, content, authorsText, researchField, keywordsText, storyDataGeneral, storyDataIntermediate, storyDataExpert, id, handleAutoSave]);

  const handleSave = async (publishNow: boolean = false) => {
    if (!title.trim() || !abstract.trim()) {
      alert('Please fill in title and abstract');
      return;
    }

    setSaving(true);
    
    const authors = authorsText.split(',').map(a => a.trim()).filter(a => a);
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
    
    const paperData = {
      title,
      abstract,
      content,
      authors,
      researchField,
      keywords,
      status: publishNow ? 'published' as const : 'draft' as const,
      storyData: {
        general: storyDataGeneral,
        intermediate: storyDataIntermediate,
        expert: storyDataExpert,
      },
    };

    let response;
    if (id) {
      response = await apiClient.updatePaper(parseInt(id), paperData);
    } else {
      response = await apiClient.createPaper(paperData);
    }

    setSaving(false);

    if (response.data) {
      navigate('/workspace');
    } else if (response.error) {
      alert(response.error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {autoSaving && (
              <span className="text-sm text-gray-500 italic">Auto-saving...</span>
            )}
            {autoSaveError && (
              <span className="text-sm text-red-600 italic">Auto-save failed: {autoSaveError}</span>
            )}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {id ? 'Edit Paper' : 'New Research Paper'}
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter paper title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abstract *
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter paper abstract"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              {previewMode ? (
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[400px]">
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['blockquote', 'code-block'],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet',
                      'script',
                      'indent',
                      'blockquote', 'code-block',
                      'align',
                      'link', 'image'
                    ]}
                    style={{ minHeight: '400px' }}
                    placeholder="Write your research paper content here..."
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authors
              </label>
              <textarea
                value={authorsText}
                onChange={(e) => setAuthorsText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter author names separated by commas (e.g., John Smith, Jane Doe, Dr. Alex Johnson)"
                rows={2}
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple authors with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Field
              </label>
              <select
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a field</option>
                <optgroup label="Physical Sciences">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Astronomy">Astronomy</option>
                  <option value="Earth Sciences">Earth Sciences</option>
                  <option value="Climate Science">Climate Science</option>
                </optgroup>
                <optgroup label="Life Sciences">
                  <option value="Biology">Biology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Genetics">Genetics</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Pharmacology">Pharmacology</option>
                  <option value="Ecology">Ecology</option>
                </optgroup>
                <optgroup label="Formal Sciences">
                  <option value="Mathematics">Mathematics</option>
                  <option value="Statistics">Statistics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Data Science">Data Science</option>
                </optgroup>
                <optgroup label="Social Sciences">
                  <option value="Psychology">Psychology</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Economics">Economics</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Anthropology">Anthropology</option>
                  <option value="Education">Education</option>
                </optgroup>
                <optgroup label="Engineering & Technology">
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Robotics">Robotics</option>
                </optgroup>
                <optgroup label="Humanities">
                  <option value="Philosophy">Philosophy</option>
                  <option value="History">History</option>
                  <option value="Linguistics">Linguistics</option>
                  <option value="Literature">Literature</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="Interdisciplinary">Interdisciplinary</option>
                  <option value="General Science">General Science</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <textarea
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter keywords separated by commas (e.g., machine learning, neural networks, AI)"
                rows={2}
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple keywords with commas</p>
            </div>

            {/* Research Stories Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Research Stories (Optional)</h2>
              <p className="text-sm text-gray-600 mb-6">
                Make your research accessible to different audiences by writing 3 levels of explanation.
                This is the core feature that makes complex research understandable for everyone.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Audience Level
                  </label>
                  <textarea
                    value={storyDataGeneral}
                    onChange={(e) => setStoryDataGeneral(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain your research in simple terms for everyone. Example: 'Scientists discovered that...' Focus on what it means for everyday life."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic/Intermediate Level
                  </label>
                  <textarea
                    value={storyDataIntermediate}
                    onChange={(e) => setStoryDataIntermediate(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain for students and educated readers. Include methodology and key findings, but explain technical terms."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expert Level
                  </label>
                  <textarea
                    value={storyDataExpert}
                    onChange={(e) => setStoryDataExpert(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full technical details for experts in your field. Include all technical terminology and precise methodology."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/workspace')}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] order-last sm:order-first"
            >
              Cancel
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperEditor;