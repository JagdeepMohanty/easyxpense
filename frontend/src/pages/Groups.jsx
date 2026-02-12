import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../services/api';
import GradientButton from '../components/ui/GradientButton';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupsAPI.getAll();
      setGroups(res.data.groups || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      setCreating(true);
      const memberList = members.split(',').map(m => m.trim()).filter(m => m);
      await groupsAPI.create({ name: groupName, members: memberList });
      setShowModal(false);
      setGroupName('');
      setMembers('');
      fetchGroups();
    } catch (err) {
      alert(err.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await groupsAPI.delete(groupId);
      fetchGroups();
    } catch (err) {
      alert(err.message || 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-darktext">Groups</h1>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Error loading groups" message={error} onRetry={fetchGroups} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-darktext">Groups</h1>
          <p className="text-darkmuted mt-1">Manage expense groups</p>
        </div>
        <GradientButton onClick={() => setShowModal(true)}>
          <span>➕</span>
          Create Group
        </GradientButton>
      </div>

      {groups.length === 0 ? (
        <div className="bg-darkcard rounded-xl p-12 text-center border border-darkborder">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-darktext mb-2">No groups yet</h3>
          <p className="text-darkmuted mb-6">Create your first group to split expenses</p>
          <GradientButton onClick={() => setShowModal(true)}>Create Group</GradientButton>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-darkcard rounded-xl p-6 border border-darkborder hover:border-accent-mid transition-all hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center text-2xl">
                  👥
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteGroup(group._id);
                  }}
                  className="text-darkmuted hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
              <h3 className="text-lg font-semibold text-darktext mb-2">{group.name}</h3>
              <p className="text-sm text-darkmuted">
                {group.members?.length || 0} members
              </p>
              <p className="text-xs text-darkmuted mt-2">
                Code: {group.group_code}
              </p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-darkcard rounded-xl p-6 max-w-md w-full border border-darkborder">
            <h2 className="text-xl font-bold text-darktext mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                  placeholder="Trip to Goa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darktext mb-2">
                  Members (comma-separated)
                </label>
                <input
                  type="text"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className="w-full px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext focus:outline-none focus:border-accent-mid"
                  placeholder="John, Sarah, Mike"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-darksecondary border border-darkborder rounded-xl text-darktext hover:bg-darkbg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-start to-accent-end rounded-xl text-white font-medium hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
