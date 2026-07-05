import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bugsService } from '../services/bugsService';
import type { Bug } from '../services/bugsService';

const BugList: React.FC = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    fetchBugs();
  }, [filter]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : undefined;
      const response = await bugsService.getBugs(params);
      setBugs(response.data?.bugs || response.data || []);
    } catch (error) {
      console.error('Failed to fetch bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    if (filter === 'all') return true;
    return bug.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bugs</h1>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'open'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('open')}
            >
              Open
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'closed'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBugs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No bugs found</p>
              </div>
            ) : (
              filteredBugs.map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <Link to={`/bugs/${bug.number}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition">
                      #{bug.number} {bug.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bug.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bug.status}
                    </span>
                    <span>by {bug.author.username}</span>
                    <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                  </div>
                  {bug.labels && bug.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {bug.labels.map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BugList;
