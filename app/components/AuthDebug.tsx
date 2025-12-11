import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const clearToken = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>Token: {token ? 'Present' : 'None'}</div>
        <div>User: {user ? user.name : 'None'}</div>
      </div>
      <button
        onClick={clearToken}
        className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Clear Token
      </button>
    </div>
  );
};

export default AuthDebug;