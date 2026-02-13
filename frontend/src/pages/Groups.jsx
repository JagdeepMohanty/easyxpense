import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../services/api';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await groupsAPI.getAll();
      setGroups(res.data.groups || []);
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const memberList = members.split(',').map(m => m.trim()).filter(m => m);
      await groupsAPI.create({ name: groupName, members: memberList });
      setShowModal(false);
      setGroupName('');
      setMembers('');
      fetchGroups();
    } catch (err) {
      // Handle error
    }
  };

  if (loading) {
    return <div className="text-primarywhite">Loading...</div>;
  }

  return (
    <div className="space-y-gap">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primarywhite">Groups</h1>
          <p className="text-muted mt-2">Manage expense groups</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-cyber-gradient text-primarywhite rounded-2xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          + Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-offblack rounded-main p-12 text-center shadow-cyber border border-white/5">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-primarywhite mb-2">No groups yet</h3>
          <p className="text-muted mb-6">Create your first group to split expenses</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-cyber-gradient text-primarywhite rounded-2xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-gap">
          {groups.map(group => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-offblack rounded-2xl p-6 shadow-cyber border border-white/5 hover:border-cyberpurple/50 hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-gradient flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
              <h3 className="text-xl font-bold text-primarywhite mb-2">{group.name}</h3>
              <p className="text-sm text-muted">{group.members?.length || 0} members</p>
              <p className="text-xs text-lavender mt-2">Code: {group.group_code}</p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-offblack rounded-2xl p-6 max-w-md w-full shadow-cyber border border-white/5">
            <h2 className="text-2xl font-bold text-primarywhite mb-6">Create New Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primarywhite mb-2">Members (comma-separated)</label>
                <input
                  type="text"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className="w-full px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-primarywhite focus:outline-none focus:border-cyberpurple transition-all"
                  placeholder="John, Sarah, Mike"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-pureblack border border-white/10 rounded-xl text-muted hover:text-primarywhite hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyber-gradient text-primarywhite rounded-xl font-semibold hover:shadow-glow hover:scale-105 transition-all duration-200"
                >
                  Create
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
