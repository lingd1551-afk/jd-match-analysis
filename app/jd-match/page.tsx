'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function JDMatchPage() {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text')
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 检查文件类型
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]
      const validExtensions = ['.pdf', '.docx', '.doc']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('不支持的文件格式，请上传PDF或DOCX文件')
        e.target.value = ''
        return
      }

      // 检查文件大小（限制10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB')
        e.target.value = ''
        return
      }

      setResumeFile(file)
      setFileName(file.name)
      setResumeText('') // 清空文本输入
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jdText.trim()) {
      alert('请输入JD内容')
      return
    }

    if (uploadMode === 'file') {
      if (!resumeFile) {
        alert('请上传简历文件')
        return
      }
    } else {
      if (!resumeText.trim()) {
        alert('请输入简历内容')
        return
      }
    }

    setIsUploading(true)
    try {
      let resumeContent = resumeText

      // 如果是文件上传模式，先上传文件并提取文本
      if (uploadMode === 'file' && resumeFile) {
        const formData = new FormData()
        formData.append('file', resumeFile)

        const uploadResponse = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('文件解析失败')
        }

        const uploadData = await uploadResponse.json()
        resumeContent = uploadData.text
      }

      // 发送分析请求
      const response = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jdText, resumeText: resumeContent }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '分析失败')
      }

      const data = await response.json()
      // 将报告数据存储到sessionStorage，然后跳转到报告页面
      sessionStorage.setItem('jdReport', JSON.stringify(data))
      router.push(`/jd-match/report?reportId=${data.reportId}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || '分析失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">JD 匹配度分析</h1>
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          上传你心仪的岗位描述，AI告诉你该如何修改简历
        </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="jd-text" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="inline-flex items-center gap-2">
                  <span>📋</span>
                  <span>岗位描述 (JD)</span>
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <textarea
                id="jd-text"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="请粘贴或输入完整的岗位描述..."
                className="w-full h-48 md:h-64 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                建议包含：岗位职责、任职要求、技能要求等完整信息
              </p>
            </div>

            <div className="mb-6">
              <label 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="inline-flex items-center gap-2">
                  <span>📄</span>
                  <span>简历内容</span>
                  <span className="text-red-500">*</span>
                </span>
              </label>

              {/* 上传方式选择 */}
              <div className="flex gap-2 md:gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('text')
                    setResumeFile(null)
                    setFileName('')
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border transition ${
                    uploadMode === 'text'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  文本输入
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('file')
                    setResumeText('')
                  }}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border transition ${
                    uploadMode === 'file'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  文件上传
                </button>
              </div>

              {/* 文本输入模式 */}
              {uploadMode === 'text' && (
                <div className="relative">
                  <textarea
                    id="resume-text"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="请粘贴或输入您的简历内容，包括：工作经历、项目经验、技能、教育背景等..."
                    className="w-full h-48 md:h-64 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required={uploadMode === 'text'}
                  />
                </div>
              )}

              {/* 文件上传模式 */}
              {uploadMode === 'file' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="resume-file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                      required={uploadMode === 'file'}
                    />
                    <label
                      htmlFor="resume-file"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                        </p>
                        <p className="text-xs text-gray-500">
                          支持 PDF、DOCX 格式，最大 10MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {fileName && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm text-gray-700 flex-1">{fileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFile(null)
                          setFileName('')
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-2 text-sm text-gray-500">
                建议包含：工作经历、项目经验、技能清单、教育背景等完整信息
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-primary text-white px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? '分析中...' : '开始分析'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}

