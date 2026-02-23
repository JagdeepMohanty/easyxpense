import React, { useState } from 'react';
import Input from './ui/Input';

const MemberSelector = ({ members = [], onChange, label = 'Members' }) => {
  const [memberName, setMemberName] = useState('');

  const handleAddMember = () => {
    const trimmed = memberName.trim();
    if (trimmed && !members.includes(trimmed)) {
      onChange([...members, trimmed]);
      setMemberName('');
    }
  };

  const handleRemoveMember = (index) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
        {label}
      </label>
      
      {/* Add Member Input */}
      <div className="flex gap-2">
        <Input
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter member name"
          className="flex-1"
        />
        <button
          type="button"
          onClick={handleAddMember}
          disabled={!memberName.trim()}
          className="px-4 py-2 h-11 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {member.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-textPrimary dark:text-textPrimary-dark font-medium">
                  {member}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMember(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {members.length === 0 && (
        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
          No members added yet. Add members using the input above.
        </p>
      )}
    </div>
  );
};

export default MemberSelector;
