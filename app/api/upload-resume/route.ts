import { NextRequest, NextResponse } from 'next/server'

// 动态导入，避免在构建时出现问题
let pdfParse: any
let mammoth: any

async function loadParsers() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default
  }
  if (!mammoth) {
    mammoth = await import('mammoth')
  }
}

export async function POST(request: NextRequest) {
  try {
    await loadParsers()
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      )
    }

    // 检查文件类型
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const validExtensions = ['.pdf', '.docx', '.doc']

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: '不支持的文件格式，请上传PDF或DOCX文件' },
        { status: 400 }
      )
    }

    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过10MB' },
        { status: 400 }
      )
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    // 根据文件类型解析
    if (fileExtension === '.pdf' || file.type === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } catch (error) {
        console.error('PDF解析错误:', error)
        return NextResponse.json(
          { error: 'PDF文件解析失败，请确保文件未损坏' },
          { status: 400 }
        )
      }
    } else if (fileExtension === '.docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } catch (error) {
        console.error('DOCX解析错误:', error)
        return NextResponse.json(
          { error: 'DOCX文件解析失败，请确保文件未损坏' },
          { status: 400 }
        )
      }
    } else if (fileExtension === '.doc' || file.type === 'application/msword') {
      // .doc格式较老，可能需要特殊处理
      // 这里先返回提示，建议用户转换为docx
      return NextResponse.json(
        { error: '不支持.doc格式，请将文件转换为.docx或.pdf格式' },
        { status: 400 }
      )
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: '无法从文件中提取文本内容，请确保文件包含可读文本' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      text: text.trim(),
      fileName: file.name,
      fileSize: file.size
    })
  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json(
      { error: '文件处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}

