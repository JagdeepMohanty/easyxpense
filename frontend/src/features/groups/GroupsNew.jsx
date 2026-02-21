import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI, friendsAPI } from '../../services/api';
import Header from '../../components/Header';
import InputBox from '../../components/InputBox';
import MemberSelector from '../../components/MemberSelector';

const GroupsNew = () => {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
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
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await friendsAPI.getAll();
      setFriends(res.data.data || []);
    } catch (err) {
      // Handle error silently
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (members) => {
    setFormData(prev => ({ ...prev, members }));
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        members: (group.members || []).map(m => ({ id: m._id || m, name: typeof m === 'string' ? m : m.name }))
      });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', members: [] });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({ name: '', members: [] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await groupsAPI.create({
        name: formData.name,
        members: formData.members.map(m => m.name)
      });
      handleCloseModal();
      fetchGroups();
    } catch (err) {
      // Handle error silently
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await groupsAPI.update(editingGroup._id, {
        name: formData.name,
        members: formData.members.map(m => m.name)
      });
      handleCloseModal();
      fetchGroups();
    } catch (err) {
      // Handle error silently
    }
  };

  const handleDelete = async (groupId) => {
    try {
      await groupsAPI.delete(groupId);
      setShowDeleteConfirm(null);
      fetchGroups();
    } catch (err) {
      // Handle error silently
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Header title="Groups" />
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
        >
          + Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card dark:bg-card-dark rounded-xl p-8 sm:p-12 text-center shadow-md">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-2">No groups yet</h3>
          <p className="text-textSecondary dark:text-textSecondary-dark mb-6">Create your first group to split expenses</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {groups.map(group => (
            <div
              key={group._id}
              className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                  👥
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(group)}
                    className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(group)}
                    className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <Link to={`/groups/${group._id}`} className="block">
                <h3 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-2">{group.name}</h3>
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark">{group.members?.length || 0} members</p>
                <p className="text-xs text-primary mt-2">Code: {group.group_code}</p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark mb-6">
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </h2>
            <form onSubmit={editingGroup ? handleUpdate : handleCreate} className="space-y-6">
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
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark hover:border-primary/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
                >
                  {editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark mb-4">Delete Group</h2>
            <p className="text-textSecondary dark:text-textSecondary-dark mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-background dark:bg-background-dark border border-primary/20 rounded-lg text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm._id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsNew;
