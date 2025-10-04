
import React, { useState } from 'react';
import { X, Calendar, User as UserIcon, Tag } from 'lucide-react';

interface AdvancedSearchFiltersProps {
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  authors?: string;
  tags?: string[];
  minReads?: number;
  hasDiscussions?: boolean;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({ onApply, onClose }) => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close advanced search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Publication Date
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="To"
              />
            </div>
          </div>

          {/* Authors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Author Name
            </label>
            <input
              type="text"
              value={filters.authors || ''}
              onChange={(e) => setFilters({ ...filters, authors: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter author name"
            />
          </div>

          {/* Engagement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Reads
            </label>
            <input
              type="number"
              value={filters.minReads || ''}
              onChange={(e) => setFilters({ ...filters, minReads: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 100"
              min="0"
            />
          </div>

          {/* Has Discussions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasDiscussions"
              checked={filters.hasDiscussions || false}
              onChange={(e) => setFilters({ ...filters, hasDiscussions: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="hasDiscussions" className="ml-2 text-sm text-gray-700">
              Only papers with active discussions
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setFilters({})}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
