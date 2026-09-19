import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bugsService } from '../services/bugsService';
import type { Bug } from '../services/bugsService';

const BugList: React.FC = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newBug, setNewBug] = useState({ title: '', description: '', labels: [] as string[] });

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
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content mb-2">🐛 Bug Tracker</h1>
              <p className="text-gray-600">Track and manage your bugs efficiently</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary btn-lg shadow-lg gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {showCreateForm ? 'Cancel' : 'New Bug'}
            </button>
          </div>
          
          <div className="tabs tabs-boxed bg-base-100 mt-6 p-1">
            <button
              className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Bugs ({bugs.length})
            </button>
            <button
              className={`tab ${filter === 'open' ? 'tab-active' : ''}`}
              onClick={() => setFilter('open')}
            >
              Open ({bugs.filter(b => b.status === 'open').length})
            </button>
            <button
              className={`tab ${filter === 'closed' ? 'tab-active' : ''}`}
              onClick={() => setFilter('closed')}
            >
              Closed ({bugs.filter(b => b.status === 'closed').length})
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {showCreateForm && (
          <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-xl">Create New Bug</h2>
              {createError && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{createError}</span>
                </div>
              )}
              <form onSubmit={handleCreateBug} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Bug Title</span>
                    <span className="label-text-alt text-gray-400">6-100 characters</span>
                  </label>
                  <input
                    type="text"
                    value={newBug.title}
                    onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                    placeholder="Enter bug title..."
                    className="input input-bordered focus:input-primary"
                    required
                    minLength={6}
                    maxLength={100}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                    <span className="label-text-alt text-gray-400">6-1000 characters</span>
                  </label>
                  <textarea
                    value={newBug.description}
                    onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                    placeholder="Describe the bug in detail..."
                    className="textarea textarea-bordered focus:textarea-primary"
                    required
                    minLength={6}
                    maxLength={1000}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    Create Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <span className="text-gray-500">Loading bugs...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBugs.length === 0 ? (
              <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body text-center py-12">
                  <div className="text-6xl mb-4">🐛</div>
                  <h3 className="text-xl font-semibold mb-2">No bugs found</h3>
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? "There are no bugs in the system yet. Create your first bug!" 
                      : `No ${filter} bugs found.`}
                  </p>
                </div>
              </div>
            ) : (
              filteredBugs.map((bug) => (
                <div key={bug.id} className="card bg-base-100 shadow hover:shadow-lg transition-all duration-200 border border-base-200 hover:border-primary/30">
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/bugs/${bug.number}`} className="text-xl font-semibold hover:text-primary transition-colors flex items-center gap-2">
                          <span className="text-gray-400 font-normal">#{bug.number}</span>
                          {bug.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className={`badge ${bug.status === 'open' ? 'badge-success' : 'badge-error'} gap-1`}>
                            {bug.status === 'open' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {bug.status}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-6">
                                <span className="text-xs">{bug.author.username.charAt(0).toUpperCase()}</span>
                              </div>
                            </div>
                            <span>{bug.author.username}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(bug.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {bug.labels && bug.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {bug.labels.map((label) => (
                              <span key={label} className="badge badge-outline badge-primary">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="hidden md:flex">
                        <Link to={`/bugs/${bug.number}`} className="btn btn-ghost btn-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
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