'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '仪表盘', icon: '📊' },
    { href: '/jd-match', label: 'JD 匹配', icon: '📄' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold">AI Coach</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">lingd1551</div>
              <div className="text-sm text-gray-500">求职中...</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              👤
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              ⬆
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* PRO Plan Card */}
          <div className="mt-8 bg-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span>
              <span className="font-bold">PRO PLAN</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              解锁100+面试模拟题与深度简历分析
            </p>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition text-sm font-medium">
              立即升级
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

