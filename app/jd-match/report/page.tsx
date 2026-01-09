'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface MatchReport {
  reportId: string
  matchScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  jdSummary: {
    title: string
    keyRequirements: string[]
    skills: string[]
  }
  resumeSuggestions: string[]
}

function MatchReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [report, setReport] = useState<MatchReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reportId = searchParams.get('reportId')
    if (reportId) {
      // 从sessionStorage获取报告数据
      const storedReport = sessionStorage.getItem('jdReport')
      if (storedReport) {
        try {
          const reportData = JSON.parse(storedReport)
          setReport(reportData)
        } catch (error) {
          console.error('Failed to parse report:', error)
        }
      }
    }
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载报告中...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到报告数据</p>
          <button
            onClick={() => router.push('/jd-match')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            返回上传页面
          </button>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">匹配度分析报告</h1>
              <p className="text-gray-600">报告ID: {report.reportId}</p>
            </div>
            <button
              onClick={() => router.push('/jd-match')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              返回
            </button>
          </div>
        </div>

        {/* Match Score */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">总体匹配度</h2>
          <div className="flex items-center gap-8">
            <div className={`w-32 h-32 rounded-full ${getScoreBgColor(report.matchScore)} flex items-center justify-center`}>
              <span className={`text-4xl font-bold ${getScoreColor(report.matchScore)}`}>
                {report.matchScore}
              </span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    report.matchScore >= 80 ? 'bg-green-500' :
                    report.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${report.matchScore}%` }}
                ></div>
              </div>
              <p className="text-gray-600">
                {report.matchScore >= 80 ? '匹配度较高，建议优化细节后投递' :
                 report.matchScore >= 60 ? '匹配度中等，需要重点提升部分技能' :
                 '匹配度较低，建议针对性提升后再投递'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-green-600">✓ 优势分析</h2>
            <ul className="space-y-3">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">⚠ 待提升</h2>
            <ul className="space-y-3">
              {report.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* JD Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">岗位要求分析</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">岗位名称</h3>
            <p className="text-gray-700">{report.jdSummary.title}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">核心要求</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {report.jdSummary.keyRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">技能要求</h3>
            <div className="flex flex-wrap gap-2">
              {report.jdSummary.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">优化建议</h2>
          <ul className="space-y-4">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-700">{rec}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Resume Suggestions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">简历修改建议</h2>
          <ul className="space-y-3">
            {report.resumeSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-primary mt-1">→</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            打印报告
          </button>
          <button
            onClick={() => router.push('/jd-match')}
            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            分析新的JD
          </button>
        </div>
    </div>
  )
}

export default function MatchReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <MatchReportContent />
    </Suspense>
  )
}

