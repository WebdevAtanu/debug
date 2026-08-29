import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bugsService } from '../services/bugsService';
import type { Bug } from '../services/bugsService';
import { useAuth } from '../contexts/AuthContext';

const BugList: React.FC = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newBug, setNewBug] = useState({ title: '', description: '', labels: [] as string[] });
  const { user } = useAuth();

  useEffect(() => {
    fetchBugs();
  }, [filter]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { status: filter } : undefined;
      const response = await bugsService.getBugs(params);
      setBugs(response.data || []);
    } catch (err: any) {
      setError(err.userMessage || 'Failed to fetch bugs');
      console.error('Failed to fetch bugs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    // Client-side validation
    if (newBug.title.length < 6) {
      setCreateError('Title must be at least 6 characters');
      return;
    }

    if (newBug.title.length > 100) {
      setCreateError('Title must be less than 100 characters');
      return;
    }

    if (newBug.description.length < 6) {
      setCreateError('Description must be at least 6 characters');
      return;
    }

    if (newBug.description.length > 1000) {
      setCreateError('Description must be less than 1000 characters');
      return;
    }

    try {
      await bugsService.createBug(newBug);
      setNewBug({ title: '', description: '', labels: [] });
      setShowCreateForm(false);
      fetchBugs();
    } catch (err: any) {
      setCreateError(err.userMessage || 'Failed to create bug');
      console.error('Failed to create bug:', err);
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
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {showCreateForm ? 'Cancel' : '+ New Bug'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Bug</h2>
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-gray-400">(6-100 characters)</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  required
                  minLength={6}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Bug title"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(6-1000 characters)</span>
                </label>
                <textarea
                  id="description"
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  required
                  minLength={6}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe the bug..."
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Create Bug
              </button>
            </form>
          </div>
        )}

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
                  key={bug.id}
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
                    <span>{new Date(bug.created_at).toLocaleDateString()}</span>
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
