// OpenAI가 반환하는 마크다운 보고서(## 제목, **강조**, - 목록)를 가볍게 렌더링합니다.
// 외부 마크다운 라이브러리 없이 이 프로젝트에 필요한 최소 문법만 처리합니다.

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export default function ReportView({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []

  function flushList(key: string) {
    if (listBuffer.length === 0) return
    elements.push(
      <ul key={key}>
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      flushList(`ul-${i}`)
      elements.push(<h3 key={i}>{trimmed.slice(3)}</h3>)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2))
    } else if (trimmed === '') {
      flushList(`ul-${i}`)
    } else {
      flushList(`ul-${i}`)
      elements.push(<p key={i}>{renderInline(trimmed)}</p>)
    }
  })
  flushList('ul-end')

  return <div className="report">{elements}</div>
}
