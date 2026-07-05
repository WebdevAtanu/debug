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
    <div className="bug-list">
      <div className="bug-list-header">
        <h2>Bugs</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'open' ? 'active' : ''}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            className={filter === 'closed' ? 'active' : ''}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="bugs">
          {filteredBugs.length === 0 ? (
            <p>No bugs found</p>
          ) : (
            filteredBugs.map((bug) => (
              <div key={bug._id} className="bug-card">
                <Link to={`/bugs/${bug.number}`}>
                  <h3>#{bug.number} {bug.title}</h3>
                </Link>
                <div className="bug-meta">
                  <span className={`status ${bug.status}`}>{bug.status}</span>
                  <span className="author">by {bug.author.username}</span>
                  <span className="date">
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {bug.labels && bug.labels.length > 0 && (
                  <div className="labels">
                    {bug.labels.map((label) => (
                      <span key={label} className="label">
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
  );
};

export default BugList;
