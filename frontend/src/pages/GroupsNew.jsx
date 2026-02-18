import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI, friendsAPI } from '../services/api';
import Header from '../components/Header';
import InputBox from '../components/InputBox';
import MemberSelector from '../components/MemberSelector';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    members: []
  });

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await groupsAPI.getAll();
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await friendsAPI.getAll();
      setFriends(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch friends');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (members) => {
    setFormData(prev => ({ ...prev, members }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await groupsAPI.create({
        name: formData.name,
        members: formData.members.map(m => m.name)
      });
      setShowModal(false);
      setFormData({ name: '', members: [] });
      fetchGroups();
    } catch (err) {
      console.error('Failed to create group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
        <div className="text-textPrimary dark:text-textPrimary-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Header title="Groups" />
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
        >
          + Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card dark:bg-card-dark rounded-xl p-12 text-center shadow-md">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-2">No groups yet</h3>
          <p className="text-textSecondary dark:text-textSecondary-dark mb-6">Create your first group to split expenses</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
              <h3 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-2">{group.name}</h3>
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark">{group.members?.length || 0} members</p>
              <p className="text-xs text-primary mt-2">Code: {group.group_code}</p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">Create New Group</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <InputBox
                label="Group Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter group name"
                required
              />

              <MemberSelector
                members={formData.members}
                onMembersChange={handleMembersChange}
                availableFriends={friends.map(f => ({ id: f._id, name: f.name }))}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark hover:border-primary/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
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