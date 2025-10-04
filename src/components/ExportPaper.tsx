
import React, { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';

interface ExportPaperProps {
  paperId: number;
  title: string;
}

export const ExportPaper: React.FC<ExportPaperProps> = ({ paperId, title }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsCitation = async (format: 'apa' | 'mla' | 'chicago' | 'bibtex' | 'endnote') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/papers/${paperId}/cite?format=${format}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([data.citation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_${format}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/papers/${paperId}`);
      if (response.ok) {
        const paper = await response.json();
        const blob = new Blob([JSON.stringify(paper, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isExporting}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        <div className="py-2">
          <button
            onClick={() => exportAsCitation('apa')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>APA Citation</span>
          </button>
          <button
            onClick={() => exportAsCitation('mla')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>MLA Citation</span>
          </button>
          <button
            onClick={() => exportAsCitation('chicago')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Chicago Citation</span>
          </button>
          <button
            onClick={() => exportAsCitation('bibtex')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>BibTeX</span>
          </button>
          <button
            onClick={() => exportAsJSON()}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <File className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
