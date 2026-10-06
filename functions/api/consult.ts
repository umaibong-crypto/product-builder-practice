// Cloudflare Pages Function: POST /api/consult
// 사진 + 키/몸무게를 받아 OpenAI(gpt-4o-mini, Vision)로 스타일 컨설팅 보고서를 생성합니다.
// OPENAI_API_KEY는 Cloudflare Pages 프로젝트의 환경 변수(Secret)로 설정해야 합니다.

interface ConsultRequestBody {
  photo?: string // data URL (base64)
  heightCm?: number
  weightKg?: number
}

interface Env {
  OPENAI_API_KEY: string
}

interface PagesContext {
  request: Request
  env: Env
}

const MAX_PHOTO_BYTES = 6 * 1024 * 1024 // data URL 기준 대략 6MB까지 허용

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return jsonResponse(
      { error: '서버에 OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.' },
      500,
    )
  }

  let body: ConsultRequestBody
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: '요청 본문이 올바른 JSON이 아닙니다.' }, 400)
  }

  const { photo, heightCm, weightKg } = body

  if (!photo || typeof photo !== 'string' || !photo.startsWith('data:image/')) {
    return jsonResponse({ error: '올바른 사진이 필요합니다.' }, 400)
  }
  if (photo.length > MAX_PHOTO_BYTES) {
    return jsonResponse({ error: '사진 용량이 너무 큽니다. 더 작은 사진을 사용해주세요.' }, 400)
  }
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return jsonResponse({ error: '키와 몸무게를 올바르게 입력해주세요.' }, 400)
  }

  const bmi = weightKg / (heightCm / 100) ** 2

  const systemPrompt = `당신은 20년 경력의 퍼스널 스타일리스트입니다. 사용자가 보낸 사진과 신체 정보(키, 몸무게)를 참고하여
전문적이고 실용적인 스타일 컨설팅 보고서를 한국어로 작성합니다.

보고서는 반드시 아래 6개 섹션으로, 마크다운 제목(##) 형식으로 구성하세요:
## 체형 분석
## 어울리는 스타일 방향
## 추천 아이템
## 추천 컬러 팔레트
## 피해야 할 스타일
## 한 줄 총평

외모에 대한 평가나 민감하고 무례한 표현은 피하고, 항상 존중하는 태도로 긍정적이고 실질적인 조언을 제공하세요.`

  const userText = `키: ${heightCm}cm, 몸무게: ${weightKg}kg (BMI ${bmi.toFixed(1)})
첨부한 사진과 위 신체 정보를 바탕으로 스타일 컨설팅 보고서를 작성해주세요.`

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1400,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: photo } },
            ],
          },
        ],
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      return jsonResponse(
        { error: `OpenAI API 요청에 실패했습니다 (${openaiRes.status}): ${errText.slice(0, 500)}` },
        502,
      )
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const report = data.choices?.[0]?.message?.content

    if (!report) {
      return jsonResponse({ error: 'OpenAI 응답에서 보고서를 찾지 못했습니다.' }, 502)
    }

    return jsonResponse({ report })
  } catch (err) {
    return jsonResponse(
      { error: `서버 오류: ${err instanceof Error ? err.message : String(err)}` },
      500,
    )
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
