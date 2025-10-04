import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
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

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [authors, setAuthors] = useState<string[]>(['']);
  const [researchField, setResearchField] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);

  useEffect(() => {
    if (id) {
      loadPaper();
    }
  }, [id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!id) return; // Don't auto-save new papers

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [title, abstract, content, authors, researchField, keywords, id]);

  const loadPaper = async () => {
    if (!id) return;
    setLoading(true);
    const response = await apiClient.getPaper(parseInt(id));
    if (response.data) {
      const paper = response.data;
      setTitle(paper.title);
      setAbstract(paper.abstract);
      setContent(paper.content || '');
      setAuthors(paper.authors && paper.authors.length > 0 ? paper.authors : ['']);
      setResearchField(paper.researchField || '');
      setKeywords(paper.keywords?.length > 0 ? paper.keywords : ['']);
    }
    setLoading(false);
  };

  const handleAutoSave = async () => {
    if (!title.trim() || !abstract.trim() || saving || autoSaving) return;

    setAutoSaving(true);
    const paperData = {
      title,
      abstract,
      content,
      authors: authors.filter(a => a.trim()),
      researchField,
      keywords: keywords.filter(k => k.trim()),
      status: 'draft' as const,
    };

    if (id) {
      await apiClient.updatePaper(parseInt(id), paperData);
    }

    setAutoSaving(false);
  };

  const handleSave = async (publishNow: boolean = false) => {
    if (!title.trim() || !abstract.trim()) {
      alert('Please fill in title and abstract');
      return;
    }

    setSaving(true);
    const paperData = {
      title,
      abstract,
      content,
      authors: authors.filter(a => a.trim()),
      researchField,
      keywords: keywords.filter(k => k.trim()),
      status: publishNow ? 'published' as const : 'draft' as const,
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

  const addAuthor = () => {
    setAuthors([...authors, '']);
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const updateAuthor = (index: number, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = value;
    setAuthors(newAuthors);
  };

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex items-center space-x-4">
            {autoSaving && (
              <span className="text-sm text-gray-500 italic">Auto-saving...</span>
            )}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
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
              <div className="space-y-2">
                {authors.map((author, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => updateAuthor(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Author name"
                    />
                    {authors.length > 1 && (
                      <button
                        onClick={() => removeAuthor(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addAuthor}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Author</span>
                </button>
              </div>
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
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Climate Science">Climate Science</option>
                <option value="Neuroscience">Neuroscience</option>
                <option value="Psychology">Psychology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="space-y-2">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => updateKeyword(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter keyword"
                    />
                    {keywords.length > 1 && (
                      <button
                        onClick={() => removeKeyword(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addKeyword}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Keyword</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/workspace')}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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