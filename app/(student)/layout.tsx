import { protectRoute } from '@/proxy'
import { ReactNode } from 'react'

export default async function StudentLayout({ children }: { children: ReactNode }) {
    await protectRoute(['student', 'admin'])
    return <>{children}</>
}
