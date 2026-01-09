import { NextRequest, NextResponse } from 'next/server'

interface ResumeData {
  experiences: Array<{
    title: string
    company: string
    duration: string
    skills: string[]
    description: string
  }>
  skills: string[]
  education: {
    degree: string
    university: string
    year: string
  }
}

// 从简历文本中提取信息
function extractResumeInfo(resumeText: string): ResumeData {
  const text = resumeText.toLowerCase()
  
  // 提取技能关键词
  const skillKeywords = ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 
                         'Python', 'Java', 'Go', 'PHP', 'C++', 'SQL', 'MongoDB', 'MySQL',
                         'Docker', 'Kubernetes', 'AWS', 'Git', 'Linux', 'HTML', 'CSS',
                         'Next.js', 'Express', 'Spring', 'Django', 'Flask', 'Vue.js',
                         'Tailwind', 'Bootstrap', 'Redux', 'Webpack', 'Nginx', 'Redis']
  
  const foundSkills: string[] = []
  skillKeywords.forEach(skill => {
    if (resumeText.includes(skill) || text.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })

  // 提取工作经历（简单模式匹配）
  const experiences: ResumeData['experiences'] = []
  const experiencePatterns = [
    /(?:工作经历|工作经验|工作履历)[:：]?\s*([\s\S]+?)(?=(?:教育|技能|项目|$))/i,
    /(\d{4}[\s\-至到~]+(?:\d{4}|至今)[\s\S]+?)(?=(?:\d{4}[\s\-至到~]|教育|技能|项目|$))/gi
  ]

  // 尝试提取工作经历描述
  const expMatches = resumeText.match(/(?:公司|就职|任职|工作)[:：]?[^\n]+/gi) || []
  if (expMatches.length > 0) {
    expMatches.slice(0, 3).forEach((match, index) => {
      const expSkills = foundSkills.filter(skill => 
        match.includes(skill) || text.includes(skill.toLowerCase())
      )
      experiences.push({
        title: `工作经历${index + 1}`,
        company: match.replace(/[:：].*$/, '').trim() || '未知公司',
        duration: '未指定',
        skills: expSkills.slice(0, 4),
        description: match.substring(0, 100)
      })
    })
  }

  // 如果没有提取到经历，至少创建一个默认的
  if (experiences.length === 0) {
    experiences.push({
      title: '工作经历',
      company: '从简历中提取',
      duration: '未指定',
      skills: foundSkills.slice(0, 4),
      description: resumeText.substring(0, 150)
    })
  }

  // 提取教育背景
  const eduMatch = resumeText.match(/(?:教育|学历|毕业)[:：]?\s*([^\n]+)/i)
  const education = {
    degree: eduMatch ? eduMatch[1].trim() : '未指定',
    university: resumeText.match(/(?:大学|学院|学校)[:：]?\s*([^\n]+)/i)?.[1]?.trim() || '未指定',
    year: resumeText.match(/(\d{4})[\s年]/)?.[1] || '未指定'
  }

  return {
    experiences,
    skills: foundSkills.length > 0 ? foundSkills : ['从简历中提取'],
    education
  }
}

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

// 提取JD中的关键信息
function extractJDInfo(jdText: string) {
  const titleMatch = jdText.match(/(?:岗位|职位|招聘)[:：]?\s*([^\n]+)/i) || 
                     jdText.match(/([^\n]+)(?:工程师|开发|经理|专员)/i)
  const title = titleMatch ? titleMatch[1].trim() : '未知岗位'

  // 提取技能关键词
  const skillKeywords = ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 
                         'Python', 'Java', 'Go', 'PHP', 'C++', 'SQL', 'MongoDB', 'MySQL',
                         'Docker', 'Kubernetes', 'AWS', 'Git', 'Linux', 'HTML', 'CSS',
                         'Next.js', 'Express', 'Spring', 'Django', 'Flask']
  
  const foundSkills: string[] = []
  skillKeywords.forEach(skill => {
    if (jdText.includes(skill)) {
      foundSkills.push(skill)
    }
  })

  // 提取关键要求
  const requirements: string[] = []
  const requirementPatterns = [
    /(?:要求|任职要求|岗位要求)[:：]\s*([^\n]+)/gi,
    /(?:熟悉|掌握|精通)([^\n，。]+)/gi,
    /(?:具备|拥有)([^\n，。]+)/gi
  ]

  requirementPatterns.forEach(pattern => {
    const matches = Array.from(jdText.matchAll(pattern))
    matches.forEach(match => {
      if (match[1] && match[1].length < 50) {
        requirements.push(match[1].trim())
      }
    })
  })

  return {
    title,
    skills: foundSkills.length > 0 ? foundSkills : ['未明确指定'],
    keyRequirements: requirements.slice(0, 5).length > 0 ? requirements.slice(0, 5) : ['请参考完整JD内容']
  }
}

// 计算匹配度
function calculateMatchScore(
  jdText: string, 
  jdInfo: ReturnType<typeof extractJDInfo>,
  resumeData: ResumeData
): {
  score: number
  strengths: string[]
  weaknesses: string[]
} {
  const resumeSkills = resumeData.skills
  const jdSkills = jdInfo.skills

  // 技能匹配度
  const matchedSkills = jdSkills.filter(skill => 
    resumeSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) || 
                           skill.toLowerCase().includes(rs.toLowerCase()))
  )
  const skillMatchRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0.5

  // 经验匹配度（简单关键词匹配）
  const experienceKeywords = ['开发', '工程师', '项目', '技术', '系统', '平台']
  const experienceMatch = experienceKeywords.filter(keyword => jdText.includes(keyword)).length / experienceKeywords.length

  // 综合匹配度
  const baseScore = (skillMatchRatio * 0.6 + experienceMatch * 0.4) * 100
  const score = Math.min(95, Math.max(30, Math.round(baseScore)))

  // 生成优势和劣势
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (matchedSkills.length > 0) {
    strengths.push(`您已掌握岗位要求的关键技能：${matchedSkills.join('、')}`)
  }

  const missingSkills = jdSkills.filter(skill => 
    !resumeSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) || 
                            skill.toLowerCase().includes(rs.toLowerCase()))
  )
  if (missingSkills.length > 0) {
    weaknesses.push(`建议补充以下技能：${missingSkills.join('、')}`)
  }

  if (skillMatchRatio >= 0.7) {
    strengths.push('技能匹配度较高，符合岗位基本要求')
  } else if (skillMatchRatio < 0.4) {
    weaknesses.push('技能匹配度较低，需要重点提升相关技术栈')
  }

  // 检查工作经验
  if (resumeData.experiences.length >= 2) {
    strengths.push('拥有丰富的工作经验，能够胜任相关岗位')
  } else if (resumeData.experiences.length === 1) {
    strengths.push('有相关工作经验，建议详细描述项目成果')
  } else {
    weaknesses.push('工作经验相对较少，建议突出项目经历和学习能力')
  }

  // 检查简历内容长度（作为丰富度的指标）
  if (jdText.length > 200 && resumeData.experiences.some(exp => exp.description.length > 50)) {
    strengths.push('简历内容较为丰富，能够展示您的专业能力')
  }

  return { score, strengths, weaknesses }
}

// 生成优化建议
function generateRecommendations(
  jdText: string,
  jdInfo: ReturnType<typeof extractJDInfo>,
  matchResult: ReturnType<typeof calculateMatchScore>,
  resumeData: ResumeData
): string[] {
  const recommendations: string[] = []

  // 技能相关建议
  const missingSkills = jdInfo.skills.filter(skill => 
    !resumeData.skills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) || 
                             skill.toLowerCase().includes(rs.toLowerCase()))
  )
  if (missingSkills.length > 0) {
    recommendations.push(
      `针对岗位要求的${missingSkills.join('、')}等技能，建议在简历中突出相关项目经验或学习经历`
    )
  }

  // 简历优化建议
  if (matchResult.score < 70) {
    recommendations.push(
      '建议根据岗位要求调整简历重点，突出与JD最相关的项目经历和工作成果'
    )
  }

  recommendations.push(
    '在简历中使用与JD相同的关键词，提高简历通过ATS（自动筛选系统）的概率'
  )

  recommendations.push(
    '量化工作成果，使用具体数字和指标展示您的能力和价值'
  )

  if (jdText.includes('团队') || jdText.includes('协作')) {
    recommendations.push(
      '强调团队协作能力和跨部门沟通经验，突出软技能'
    )
  }

  return recommendations
}

// 生成简历修改建议
function generateResumeSuggestions(
  jdInfo: ReturnType<typeof extractJDInfo>,
  matchResult: ReturnType<typeof calculateMatchScore>,
  resumeData: ResumeData
): string[] {
  const suggestions: string[] = []

  // 根据匹配的技能给出具体建议
  const matchedSkills = jdInfo.skills.filter(skill => 
    resumeData.skills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) || 
                            skill.toLowerCase().includes(rs.toLowerCase()))
  )

  if (matchedSkills.length > 0) {
    suggestions.push(
      `在技能部分突出显示：${matchedSkills.join('、')}，这些是岗位的核心要求`
    )
  }

  suggestions.push(
    '在项目经历中，优先展示与岗位要求最相关的项目，并详细描述使用的技术和解决的问题'
  )

  suggestions.push(
    '在自我评价或工作描述中，使用JD中出现的关键词，提高匹配度'
  )

  if (matchResult.score < 60) {
    suggestions.push(
      '考虑添加相关的培训经历、在线课程或认证，展示您对岗位相关技能的学习能力'
    )
  }

  suggestions.push(
    '确保简历格式清晰，重点突出，便于HR快速识别您的核心优势'
  )

  return suggestions
}

export async function POST(request: NextRequest) {
  try {
    const { jdText, resumeText } = await request.json()

    if (!jdText || typeof jdText !== 'string' || jdText.trim().length < 50) {
      return NextResponse.json(
        { error: 'JD内容过短，请提供完整的岗位描述（至少50个字符）' },
        { status: 400 }
      )
    }

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: '简历内容过短，请提供完整的简历信息（至少30个字符）' },
        { status: 400 }
      )
    }

    // 提取JD信息
    const jdInfo = extractJDInfo(jdText)

    // 提取简历信息
    const resumeData = extractResumeInfo(resumeText)

    // 计算匹配度
    const matchResult = calculateMatchScore(jdText, jdInfo, resumeData)

    // 生成建议
    const recommendations = generateRecommendations(jdText, jdInfo, matchResult, resumeData)
    const resumeSuggestions = generateResumeSuggestions(jdInfo, matchResult, resumeData)

    // 生成报告ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const report: MatchReport = {
      reportId,
      matchScore: matchResult.score,
      strengths: matchResult.strengths,
      weaknesses: matchResult.weaknesses,
      recommendations,
      jdSummary: jdInfo,
      resumeSuggestions
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error analyzing JD:', error)
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}

