import type { Metadata } from 'next'
import Layout from '@/components/Layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Career Coach - JD匹配分析',
  description: 'AI驱动的职业教练平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

