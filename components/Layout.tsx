'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/', label: '仪表盘', icon: '📊' },
    { href: '/jd-match', label: 'JD 匹配', icon: '📄' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded flex items-center justify-center text-white font-bold text-lg md:text-xl">
              C
            </div>
            <span className="text-lg md:text-xl font-bold">AI Coach</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block text-right">
              <div className="font-medium text-sm">lingd1551</div>
              <div className="text-xs text-gray-500">求职中...</div>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm md:text-base">
              👤
            </div>
            <button className="hidden md:flex w-10 h-10 rounded-full bg-gray-100 items-center justify-center hover:bg-gray-200">
              ⬆
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static top-0 left-0 h-full md:h-auto z-50 w-64 bg-gray-100 min-h-[calc(100vh-73px)] p-4 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
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
              <span className="font-bold text-sm">PRO PLAN</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              解锁100+面试模拟题与深度简历分析
            </p>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition text-sm font-medium">
              立即升级
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

