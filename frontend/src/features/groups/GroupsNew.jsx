import React, { useState, useEffect } from 'react';
import { groupsAPI, friendsAPI } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import Input from '../../components/ui/Input';
import { UserPlus, Pencil, Trash2, Plus, X } from 'lucide-react';

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
  const [newMember, setNewMember] = useState('');

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

  const handleAddMember = () => {
    if (newMember.trim() && !formData.members.includes(newMember.trim())) {
      setFormData(prev => ({ ...prev, members: [...prev.members, newMember.trim()] }));
      setNewMember('');
    }
  };

  const handleRemoveMember = (member) => {
    setFormData(prev => ({ ...prev, members: prev.members.filter(m => m !== member) }));
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        members: group.members || []
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
    setNewMember('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await groupsAPI.update(editingGroup._id, {
          name: formData.name,
          members: formData.members
        });
      } else {
        await groupsAPI.create({
          name: formData.name,
          members: formData.members
        });
      }
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-textPrimary dark:text-textPrimary-dark">Groups</h1>
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
              Create and manage expense groups
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            <Plus size={20} />
            Create Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-card dark:bg-card-dark rounded-xl p-12 shadow-lg text-center">
            <UserPlus className="mx-auto mb-4 text-textSecondary dark:text-textSecondary-dark" size={48} />
            <h3 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark mb-2">No groups yet</h3>
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-6">Create your first group to split expenses</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Plus size={20} />
              Create Group
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div
                key={group._id}
                className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(group)}
                      className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                      title="Edit group"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(group)}
                      className="p-2 text-textSecondary dark:text-textSecondary-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete group"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-2">{group.name}</h3>
                <p className="text-sm text-textSecondary dark:text-textSecondary-dark">{group.members?.length || 0} members</p>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-lg">
              <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Group Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
                    Members
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                      placeholder="Add member name"
                      className="flex-1 h-11 px-4 bg-surface dark:bg-surface-dark border-0 rounded-lg text-textPrimary dark:text-textPrimary-dark placeholder:text-textSecondary dark:placeholder:text-textSecondary-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-4 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.members.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                        <span className="text-sm text-textPrimary dark:text-textPrimary-dark">{member}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          className="p-1 text-textSecondary dark:text-textSecondary-dark hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
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
              <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">Delete Group</h2>
              <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-6">
                Are you sure you want to delete "{showDeleteConfirm.name}"?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm._id)}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GroupsNew;
