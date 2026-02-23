import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import MemberSelector from '../components/MemberSelector';

const GroupsNew = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', members: [] });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAll();
      setGroups(response.data.groups || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (formData.members.length === 0) {
      setError('Add at least one member');
      return;
    }

    try {
      setCreating(true);
      await groupsAPI.create(formData);
      setShowCreateModal(false);
      setFormData({ name: '', members: [] });
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    
    try {
      await groupsAPI.delete(id);
      fetchGroups();
    } catch (err) {
      alert('Failed to delete group');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Groups</h1>
            <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Manage your expense groups</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            + Create Group
          </button>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon="👨‍👩‍👧‍👦"
            title="No groups yet"
            description="Create your first group to organize expenses with multiple people"
            action={() => setShowCreateModal(true)}
            actionLabel="Create First Group"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div key={group.id || group._id} className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark">{group.name}</h3>
                    <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Code: {group.group_code || group.groupCode}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(group.id || group._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {(group.members || []).map((member, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/groups/${group.id || group._id}`)}
                  className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Create Group</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Group Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Weekend Trip"
                  required
                />

                <MemberSelector
                  members={formData.members}
                  onChange={(members) => setFormData({ ...formData, members })}
                  label="Group Members"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', members: [] });
                      setError('');
                    }}
                    className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-textPrimary dark:text-textPrimary-dark font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GroupsNew;
