import React, { useState } from 'react';

const MemberSelector = ({ members = [], onMembersChange, availableFriends = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const addMember = (friend) => {
    if (!members.find(m => m.id === friend.id)) {
      onMembersChange([...members, friend]);
    }
    setShowDropdown(false);
  };

  const removeMember = (memberId) => {
    onMembersChange(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
        Group Members
      </label>
      <div className="bg-background dark:bg-background-dark border border-primary/20 rounded-lg px-3 py-2 flex gap-2 flex-wrap min-h-[48px] items-center">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-2 text-sm flex items-center gap-2"
          >
            {member.name}
            <button
              type="button"
              onClick={() => removeMember(member.id)}
              className="text-primary hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-primary text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
          >
            +
          </button>
          {showDropdown && (
            <div className="absolute top-10 left-0 bg-card dark:bg-card-dark border border-primary/20 rounded-lg shadow-lg z-10 min-w-[200px]">
              {availableFriends.filter(f => !members.find(m => m.id === f.id)).map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => addMember(friend)}
                  className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors text-textPrimary dark:text-textPrimary-dark"
                >
                  {friend.name}
                </button>
              ))}
              {availableFriends.filter(f => !members.find(m => m.id === f.id)).length === 0 && (
                <div className="px-4 py-2 text-textSecondary dark:text-textSecondary-dark text-sm">
                  No more friends available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberSelector;