'use client';
import React, { useEffect, useState } from 'react';
import { CommunityPost, CommunityReply } from '@/types/community';

interface PostDetailProps {
    post: CommunityPost;
    onClose: () => void;
}

export default function PostDetail({ post, onClose }: PostDetailProps) {
    const [replies, setReplies] = useState<CommunityReply[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const res = await fetch(`/api/community/posts/${post.id}/replies`);
                const data = await res.json();
                setReplies(data);
            } catch (error) {
                console.error('Error fetching replies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReplies();
    }, [post.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {post.user_name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{post.user_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Asked on {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-8">
                        <p className="text-lg text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags?.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                                {replies.length}
                            </span>
                            Replies
                        </h4>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p>No replies yet. Alumni will respond shortly via WhatsApp!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {replies.map((reply) => (
                                    <div key={reply.id} className={`flex ${reply.is_alumni ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-5 ${reply.is_alumni
                                            ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 shadow-sm'
                                            : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-bold ${reply.is_alumni ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {reply.user_name}
                                                    </span>
                                                    {reply.is_alumni && (
                                                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                            Alumni
                                                        </span>
                                                    )}
                                                    {reply.source === 'whatsapp' && (
                                                        <span className="text-green-600 dark:text-green-400 text-xs flex items-center" title="Replied via WhatsApp">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                                            </svg>
                                                            WhatsApp
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
