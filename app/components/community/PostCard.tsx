import React from 'react';
import { CommunityPost } from '@/types/community';

interface PostCardProps {
    post: CommunityPost;
    onClick: (post: CommunityPost) => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        // In a real app, you'd call an API here
        // For now, we'll just rely on the parent to update the state or just show visual feedback
    };

    return (
        <div
            onClick={() => onClick(post)}
            className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {post.user_name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {post.user_name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${post.status === 'resolved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {post.status === 'resolved' ? 'Resolved' : 'Open'}
                </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                {post.content}
            </p>

            <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 text-sm transition-colors ${post.liked_by_me
                            ? 'text-pink-500 dark:text-pink-400'
                            : 'hover:text-pink-500 dark:hover:text-pink-400'
                            }`}
                    >
                        <svg
                            className={`w-5 h-5 ${post.liked_by_me ? 'fill-current' : 'fill-none'}`}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center space-x-1 text-sm hover:text-indigo-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.45-2.125L3 19l.75-3.541A8 8 0 1121 12z" />
                        </svg>
                        <span>Reply</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
