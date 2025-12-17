import { protectRoute } from '@/proxy'
import { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function ParentLayout({ children }: { children: ReactNode }) {
    await protectRoute(['parent', 'admin'])

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            {/* We can potentially have a specific Parent Header later, or reuse global */}
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}
