'use client';
import React, { useEffect, useState } from 'react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface User {
    user_id: string | number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
}

const UserManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' as 'student' | 'instructor' | 'admin'
    });
    const [showNewUserPassword, setShowNewUserPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const PAGE_SIZE = 50;

    // Quiz Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUserForQuiz, setSelectedUserForQuiz] = useState<User | null>(null);
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");

    useEffect(() => {
        loadUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    async function loadUsers(page = 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/users?page=${page}&pageSize=${PAGE_SIZE}`, {
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: Failed to load users`);
            }

            const data = await response.json();

            console.log('Users loaded successfully:', data.users?.length || 0, '/', data.total);
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setError('Request timed out. The database may be slow. Please try again.');
            } else {
                console.error('Failed to load users:', error);
                setError(error.message || 'Failed to load users. Please check your connection.');
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    }

    async function handleRoleChange(userId: string | number, newRole: 'student' | 'instructor' | 'admin') {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update role');
            }

            // Update local state
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
            alert('User role updated successfully!');
        } catch (error: any) {
            console.error('Failed to update role:', error);
            alert(`Failed to update user role: ${error.message}`);
        }
    }

    async function handleDeleteUser(userId: string | number) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            setUsers(users.filter(u => u.user_id !== userId));
            alert('User deleted successfully!');
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            alert(`Failed to delete user: ${error.message}`);
        }
    }

    async function handleAddUser(e: React.FormEvent) {
        e.preventDefault();

        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Call API to create user
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            // Add to local state
            if (data.user) {
                setUsers([data.user, ...users]);
            }

            // Reset form and close modal
            setNewUser({ name: '', email: '', password: '', role: 'student' });
            setShowAddModal(false);
            alert('User added successfully!');

            // Reload users to get fresh data
            loadUsers(currentPage);
        } catch (error: any) {
            console.error('Failed to add user:', error);
            alert(`Failed to add user: ${error.message || 'Unknown error'}`);
        }
    }

    async function handleBulkUpload(e: React.FormEvent) {
        e.preventDefault();

        if (!uploadFile) {
            alert('Please select a file to upload');
            return;
        }

        try {
            setUploadProgress(10);
            const fileText = await uploadFile.text();
            setUploadProgress(20);

            // Parse CSV
            const lines = fileText.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Validate headers
            const requiredHeaders = ['name', 'email', 'password', 'role'];
            const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));

            if (!hasAllHeaders) {
                throw new Error(`CSV must have headers: ${requiredHeaders.join(', ')}`);
            }

            setUploadProgress(30);

            // Parse rows
            const usersToAdd = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const userObj: any = {};

                headers.forEach((header, index) => {
                    userObj[header] = values[index];
                });

                if (userObj.name && userObj.email && userObj.password) {
                    usersToAdd.push({
                        name: userObj.name,
                        email: userObj.email,
                        password: userObj.password,
                        role: userObj.role || 'student'
                    });
                }
            }

            if (usersToAdd.length === 0) {
                throw new Error('No valid users found in the file');
            }

            setUploadProgress(40);

            // Import users one by one
            let successCount = 0;
            let failCount = 0;
            const progressIncrement = 60 / usersToAdd.length;

            for (const user of usersToAdd) {
                try {
                    // Call API to create user
                    const response = await fetch('/api/admin/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(user),
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Failed to create user');
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Failed to add user ${user.email}:`, err);
                    failCount++;
                }

                setUploadProgress(prev => Math.min(prev + progressIncrement, 95));
            }

            setUploadProgress(100);

            // Reset and close
            setUploadFile(null);
            setShowBulkUploadModal(false);
            setUploadProgress(0);

            alert(`Bulk upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);

            // Reload users
            loadUsers(1);
            setCurrentPage(1);
        } catch (error: any) {
            console.error('Bulk upload failed:', error);
            alert(`Bulk upload failed: ${error.message || 'Unknown error'}`);
            setUploadProgress(0);
        }
    }

    async function openAssignModal(user: User) {
        setSelectedUserForQuiz(user);
        setShowAssignModal(true);
        setSelectedQuizId("");

        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('quiz_id, title')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAvailableQuizzes(data || []);
        } catch (error) {
            console.error('Error loading quizzes:', error);
            alert('Failed to load quizzes');
        }
    }

    async function handleAssignQuiz(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedUserForQuiz || !selectedQuizId) return;

        try {
            const { error } = await supabase
                .from('quiz_assignments')
                .insert({
                    quiz_id: parseInt(selectedQuizId),
                    user_id: selectedUserForQuiz.user_id,
                    status: 'assigned',
                    assigned_at: new Date().toISOString()
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert('This quiz is already assigned to this user.');
                } else {
                    throw error;
                }
            } else {
                alert('Quiz assigned successfully!');
                setShowAssignModal(false);
            }
        } catch (error: any) {
            console.error('Failed to assign quiz:', error);
            alert('Failed to assign quiz: ' + error.message);
        }
    }

    function downloadTemplate() {
        const csvContent = 'name,email,password,role\nJohn Doe,john@example.com,password123,student\nJane Smith,jane@example.com,password456,instructor';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'instructor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <RoleProtectedRoute allowedRoles={['admin']}>
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans min-h-screen">
                <Header />
                <main className="min-h-screen bg-gray-50 dark:bg-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        👥 User Management
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                                        Manage user accounts, roles, and permissions
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {totalUsers || users.length}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
                                    </div>
                                    <button
                                        onClick={() => loadUsers(currentPage)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {loading ? 'Loading...' : 'Refresh'}
                                    </button>
                                    <button
                                        onClick={() => setShowBulkUploadModal(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Bulk Upload
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add User
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        {!error && users.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Students</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {users.filter(u => u.role === 'student').length}
                                            </p>
                                        </div>
                                        <div className="text-3xl">🎓</div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Instructors</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {users.filter(u => u.role === 'instructor').length}
                                            </p>
                                        </div>
                                        <div className="text-3xl">👨‍🏫</div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Admins</p>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {users.filter(u => u.role === 'admin').length}
                                            </p>
                                        </div>
                                        <div className="text-3xl">🛡️</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            Error Loading Users
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                            {error}
                                        </div>
                                        <button
                                            onClick={loadUsers}
                                            className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                                        >
                                            Try Again →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Search Users
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Filter by Role
                                    </label>
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="student">Students</option>
                                        <option value="instructor">Instructors</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    Loading users...
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    {error ? 'Unable to load users' : 'No users found matching your criteria'}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-gray-600">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-600">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    ID: {user.user_id.toString().substring(0, 8)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.user_id, e.target.value as any)}
                                                            disabled={user.user_id === String(currentUser?.user_id)}
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)} border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="instructor">Instructor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.user_id)}
                                                            disabled={user.user_id === String(currentUser?.user_id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Delete
                                                        </button>
                                                        {user.role === 'student' && (
                                                            <button
                                                                onClick={() => openAssignModal(user)}
                                                                className="ml-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Assign Quiz
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && totalUsers > PAGE_SIZE && (
                            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4 mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalUsers)} of {totalUsers} users
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 rounded-lg disabled:opacity-40 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Page {currentPage} of {Math.ceil(totalUsers / PAGE_SIZE)}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage * PAGE_SIZE >= totalUsers}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 rounded-lg disabled:opacity-40 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewUserPassword ? "text" : "password"}
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                            placeholder="••••••••"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showNewUserPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bulk Upload Modal */}
                {showBulkUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload Users</h2>
                                <button
                                    onClick={() => {
                                        setShowBulkUploadModal(false);
                                        setUploadFile(null);
                                        setUploadProgress(0);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleBulkUpload} className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                        📋 CSV Format Required
                                    </h3>
                                    <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                                        Your CSV file must have these columns:
                                    </p>
                                    <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded block">
                                        name, email, password, role
                                    </code>
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Template CSV
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Upload CSV File *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-400"
                                        required
                                    />
                                    {uploadFile && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            ✓ Selected: {uploadFile.name}
                                        </p>
                                    )}
                                </div>

                                {uploadProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBulkUploadModal(false);
                                            setUploadFile(null);
                                            setUploadProgress(0);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        disabled={uploadProgress > 0}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!uploadFile || uploadProgress > 0}
                                    >
                                        {uploadProgress > 0 ? 'Uploading...' : 'Upload Users'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </RoleProtectedRoute>
    );
};

export default UserManagementPage;
