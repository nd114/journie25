import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

interface PaperCardProps {
  id: number;
  title: string;
  abstract: string;
  authors: string[];
  createdAt: string;
  status?: string;
}

const PaperCard: React.FC<PaperCardProps> = ({ id, title, abstract, authors, createdAt, status }) => {
  return (
    <Link to={`/paper/${id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        {status && (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-3 ${
            status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{abstract}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{authors.join(', ')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PaperCard;
