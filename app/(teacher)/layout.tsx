import { protectRoute } from '@/proxy'
import { ReactNode } from 'react'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
    await protectRoute(['teacher', 'admin'])
    return <>{children}</>
}
