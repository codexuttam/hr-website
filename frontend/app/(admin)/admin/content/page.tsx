"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Shield, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter,
  MoreVertical,
  MessageSquare,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  status: 'open' | 'resolved' | 'flagged';
  tags: string[];
}

export default function ContentModerationPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const response = await fetch('/api/community/posts');
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      // In a real app, you'd call a DELETE API: /api/community/posts/[postId]
      setPosts(posts.filter(p => p.id !== postId));
      alert('Post deleted successfully');
    } catch (error) {
      alert('Failed to delete post');
    }
  }

  async function handleUpdateStatus(postId: string, status: 'open' | 'resolved' | 'flagged') {
    try {
      setPosts(posts.map(p => p.id === postId ? { ...p, status } : p));
      // In a real app, you'd call a PATCH API
    } catch (error) {
      alert('Failed to update post status');
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = (post.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                         (post.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-red-400 font-semibold uppercase tracking-wider text-xs">
              <Shield className="h-4 w-4" />
              Admin Controls
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Content Moderation
            </h1>
            <p className="text-slate-400 mt-2">
              Review, approve, and manage community posts and discussions.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
            <div className="text-center px-4 border-r border-slate-800">
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Posts</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-bold text-amber-500">{posts.filter(p => p.status === 'open').length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Pending</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by content or username..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('open')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'open' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('flagged')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'flagged' ? 'bg-red-500/10 text-red-500' : 'text-slate-400 hover:text-white'}`}
            >
              Flagged
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading community posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900/60 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{post.user_name || 'Anonymous'}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {post.created_at ? (
                          <>
                            {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Post"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                  {post.content}
                </div>
                
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {post.tags?.map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                  
                  <div className="ml-auto flex items-center gap-3">
                    {post.status !== 'resolved' && (
                      <button 
                        onClick={() => handleUpdateStatus(post.id, 'resolved')}
                        className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-all"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}
                    {post.status !== 'flagged' && (
                      <button 
                        onClick={() => handleUpdateStatus(post.id, 'flagged')}
                        className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
              <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">No posts found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
