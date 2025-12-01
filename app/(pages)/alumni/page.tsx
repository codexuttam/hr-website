'use client';
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AskDoubtForm from '../../components/community/AskDoubtForm';
import PostCard from '../../components/community/PostCard';
import PostDetail from '../../components/community/PostDetail';
import Toast from '../../components/ui/Toast';
import { CommunityPost } from '../../types/community';

export default function AlumniCommunityPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/community/posts');
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setToast({ message: 'Failed to load posts', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostCreated = () => {
        fetchPosts();
        setToast({ message: 'Doubt posted successfully!', type: 'success' });
    };

    const filteredPosts = posts
        .filter(post => {
            if (filter !== 'all' && post.status !== filter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    post.content.toLowerCase().includes(query) ||
                    post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                    post.user_name.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'latest') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return (b.likes || 0) - (a.likes || 0);
            }
        });

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col">
            <Header />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight animate-fade-in-up">
                        Alumni Community <span className="text-indigo-200">Connect</span>
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up delay-100">
                        Stuck on a problem? Ask your doubts here and get answers directly from our alumni network via their exclusive WhatsApp community.
                    </p>
                    <div className="flex justify-center space-x-4 animate-fade-in-up delay-200">
                        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 shadow-lg hover:bg-white/20 transition-colors cursor-default">
                            <span className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                            <span className="text-white font-medium">Alumni Online on WhatsApp</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Ask Doubt & Filters */}
                    <div className="lg:col-span-1 space-y-8">
                        <AskDoubtForm onPostCreated={handlePostCreated} />

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filter Posts</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${filter === 'all'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:pl-5'
                                        }`}
                                >
                                    All Discussions
                                </button>
                                <button
                                    onClick={() => setFilter('open')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${filter === 'open'
                                        ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold border-l-4 border-yellow-500 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:pl-5'
                                        }`}
                                >
                                    Unresolved Doubts
                                </button>
                                <button
                                    onClick={() => setFilter('resolved')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${filter === 'resolved'
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold border-l-4 border-green-500 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:pl-5'
                                        }`}
                                >
                                    Resolved
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Discussions</h2>

                            <div className="flex items-center space-x-3">
                                {/* Search Bar */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search topics..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-48 transition-all focus:w-64"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Sort Dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
                                    className="pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="popular">Popular</option>
                                </select>

                                <button
                                    onClick={fetchPosts}
                                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Refresh Feed"
                                >
                                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-4xl">💬</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No discussions found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    {searchQuery ? `No results for "${searchQuery}"` : "Be the first to ask a doubt and start the conversation!"}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onClick={setSelectedPost}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {selectedPost && (
                <PostDetail
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}

            <Footer />
        </div>
    );
}
