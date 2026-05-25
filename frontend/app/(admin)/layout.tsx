import { protectRoute } from '@/proxy'
import { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    await protectRoute(['admin'])
    return <>{children}</>
}
