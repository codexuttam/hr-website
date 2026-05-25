'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const publicPaths = ['/', '/login', '/register', '/acknowledgment'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Check if the current path is public
        const isPublicPath = publicPaths.includes(pathname);

        // Also allow paths that start with /auth/ (if any future auth routes are added)
        // or /api/ (though layout usually doesn't wrap API, safety check)
        const isPublicPrefix = pathname.startsWith('/api/');

        if (loading) {
            return;
        }

        if (!isAuthenticated && !isPublicPath && !isPublicPrefix) {
            // Not authenticated and trying to access private route
            console.log(`Access denied to ${pathname}, redirecting to login`);
            router.push('/login');
        } else {
            // Authenticated or accessing public route
            setIsAuthorized(true);
        }
    }, [user, loading, isAuthenticated, pathname, router]);

    // While loading auth state, show a loading spinner
    // This prevents the "flash" of protected content
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated and on private route, render nothing (or loader) while redirect happens
    // This prevents protected content from flashing before redirect
    if (!isAuthenticated && !publicPaths.includes(pathname) && !pathname.startsWith('/api/')) {
        return null;
    }

    return <>{children}</>;
}
