import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">欢迎回来,同学! 👋</h1>
        <p className="text-sm md:text-base text-gray-600">今天我们该如何提升你的竞争力?</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏆</span>
            <h3 className="text-gray-600">简历完整度</h3>
          </div>
          <p className="text-3xl font-bold">0%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <h3 className="text-gray-600">匹配岗位</h3>
          </div>
          <p className="text-3xl font-bold">0 个</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📄</span>
            <h3 className="text-gray-600">结构化经历</h3>
          </div>
          <p className="text-3xl font-bold">0 条</p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">快速开始</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/jd-match"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                <h3 className="font-semibold">JD 匹配度分析</h3>
              </div>
              <span className="text-gray-400 group-hover:text-primary transition">→</span>
            </div>
            <p className="text-gray-600 text-sm">
              上传你心仪的岗位描述,AI告诉你该如何修改简历。
            </p>
          </Link>
        </div>
      </div>
    </>
  )
}

