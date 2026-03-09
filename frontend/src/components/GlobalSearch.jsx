import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Receipt, Users } from 'lucide-react';
import api from '../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(response.data.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result) => {
    if (result.type === 'friend') {
      navigate('/friends');
    } else if (result.type === 'expense') {
      navigate('/expenses');
    } else if (result.type === 'group') {
      navigate('/groups');
    }
    setQuery('');
    setIsOpen(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'friend': return <User className="w-4 h-4" />;
      case 'expense': return <Receipt className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search friends, expenses, groups..."
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.total === 0 ? (
            <div className="p-4 text-center text-gray-400">No results found</div>
          ) : (
            <>
              {results.friends?.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Friends</div>
                  {results.friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleResultClick(friend)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left"
                    >
                      {getIcon('friend')}
                      <div>
                        <div className="text-white font-medium">{friend.name}</div>
                        {friend.phone && <div className="text-sm text-gray-400">{friend.phone}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.expenses?.length > 0 && (
                <div className="p-2 border-t border-gray-700">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Expenses</div>
                  {results.expenses.map((expense) => (
                    <button
                      key={expense.id}
                      onClick={() => handleResultClick(expense)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left"
                    >
                      {getIcon('expense')}
                      <div className="flex-1">
                        <div className="text-white font-medium">{expense.description}</div>
                        <div className="text-sm text-gray-400">
                          ₹{expense.amount} • {expense.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.groups?.length > 0 && (
                <div className="p-2 border-t border-gray-700">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Groups</div>
                  {results.groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleResultClick(group)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg text-left"
                    >
                      {getIcon('group')}
                      <div>
                        <div className="text-white font-medium">{group.name}</div>
                        <div className="text-sm text-gray-400">{group.members?.length || 0} members</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
