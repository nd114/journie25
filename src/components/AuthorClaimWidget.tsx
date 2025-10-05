
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PotentialClaim {
  id: number;
  title: string;
  authors: string[];
  publishedAt: string;
}

interface AuthorClaimWidgetProps {
  onClaimSuccess?: () => void;
}

export default function AuthorClaimWidget({ onClaimSuccess }: AuthorClaimWidgetProps) {
  const { user } = useAuth();
  const [potentialClaims, setPotentialClaims] = useState<PotentialClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [orcid, setOrcid] = useState('');

  useEffect(() => {
    if (user) {
      fetchPotentialClaims();
    }
  }, [user]);

  const fetchPotentialClaims = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/potential-claims', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const claims = await response.json();
        setPotentialClaims(claims);
      }
    } catch (error) {
      console.error('Error fetching potential claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAuthorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) return;

    setClaiming(true);
    try {
      const response = await fetch('/api/user/claim-authorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          orcid: orcid.trim() || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.message}`);
        
        // Refresh potential claims
        await fetchPotentialClaims();
        
        // Reset form
        setAuthorName('');
        setOrcid('');
        
        onClaimSuccess?.();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error claiming authorship:', error);
      alert('Failed to claim authorship');
    } finally {
      setClaiming(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">📝 Claim Your Publications</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Are you an author of papers imported from external sources? Claim them to link them to your profile!
        </p>
        
        <form onSubmit={handleClaimAuthorship} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name as it appears in publications
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Smith J, John Smith, J. Smith"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter any variation of your name that might appear in author lists
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ORCID iD (optional)
            </label>
            <input
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0000-0000-0000-0000"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, this will be added to your profile
            </p>
          </div>
          
          <button
            type="submit"
            disabled={claiming || !authorName.trim()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {claiming ? 'Claiming...' : 'Claim Publications'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Finding potential matches...</p>
        </div>
      ) : potentialClaims.length > 0 ? (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            📋 Papers that might be yours ({potentialClaims.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {potentialClaims.map((claim) => (
              <div key={claim.id} className="border border-gray-200 rounded-md p-3">
                <h5 className="font-medium text-sm text-gray-900 mb-1">
                  {claim.title}
                </h5>
                <p className="text-xs text-gray-600">
                  Authors: {claim.authors.join(', ')}
                </p>
                {claim.publishedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Published: {new Date(claim.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Tip: Use the form above to claim these publications by entering your author name
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            No potential matches found. Use the form above to claim publications.
          </p>
        </div>
      )}
    </div>
  );
}
