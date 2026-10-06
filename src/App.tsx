import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import './App.css'
import ReportView from './ReportView'
import { bmiLabel, calcBmi, EMPTY_PROFILE, type StyleProfile } from './types'

const STORAGE_KEY = 'stylist-profile'

function loadProfile(): StyleProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROFILE
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_PROFILE
  }
}

function App() {
  const [profile, setProfile] = useState<StyleProfile>(loadProfile)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [report, setReport] = useState<string | null>(null)
  const [consulting, setConsulting] = useState(false)
  const [consultError, setConsultError] = useState<string | null>(null)

  useEffect(() => {
    setSaved(false)
  }, [profile.photo, profile.heightCm, profile.weightKg])

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile((p) => ({ ...p, photo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setSaved(true)
  }

  function handleReset() {
    setProfile(EMPTY_PROFILE)
    localStorage.removeItem(STORAGE_KEY)
    setSaved(false)
    setReport(null)
    setConsultError(null)
  }

  async function handleConsult() {
    if (!profile.photo || !profile.heightCm || !profile.weightKg) return
    setConsulting(true)
    setConsultError(null)
    setReport(null)
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: profile.photo,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
        }),
      })
      const data = (await res.json()) as { report?: string; error?: string }
      if (!res.ok || !data.report) {
        throw new Error(data.error ?? '보고서를 받지 못했습니다.')
      }
      setReport(data.report)
    } catch (err) {
      setConsultError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setConsulting(false)
    }
  }

  const bmi =
    profile.heightCm && profile.weightKg
      ? calcBmi(profile.heightCm, profile.weightKg)
      : null

  const isValid = Boolean(profile.photo && profile.heightCm && profile.weightKg)

  return (
    <div className="wrap">
      <h1>👗 퍼스널 스타일리스트</h1>
      <p className="subtitle">
        사진과 키, 몸무게를 입력하면 나에게 맞는 스타일을 추천해드려요
      </p>

      <form className="profile-card" onSubmit={handleSubmit}>
        <div className="photo-section">
          <button
            type="button"
            className="photo-upload"
            onClick={handlePhotoClick}
            aria-label="프로필 사진 업로드"
          >
            {profile.photo ? (
              <img src={profile.photo} alt="업로드한 프로필 사진" />
            ) : (
              <span className="photo-placeholder">
                <span className="icon">📷</span>
                사진 업로드
              </span>
            )}
            <span className="photo-edit-badge">
              {profile.photo ? '변경' : '선택'}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            hidden
          />
        </div>

        <div className="fields">
          <label className="field">
            <span>키 (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              min={100}
              max={250}
              step={0.1}
              placeholder="예: 170"
              value={profile.heightCm ?? ''}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  heightCm: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </label>

          <label className="field">
            <span>몸무게 (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              min={30}
              max={200}
              step={0.1}
              placeholder="예: 60"
              value={profile.weightKg ?? ''}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  weightKg: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </label>
        </div>

        {bmi !== null && (
          <div className="bmi-preview">
            BMI {bmi.toFixed(1)} · <strong>{bmiLabel(bmi)}</strong>
          </div>
        )}

        <div className="controls">
          <button type="submit" disabled={!isValid}>
            {saved ? '저장됨 ✓' : '정보 저장하기'}
          </button>
          <button type="button" className="secondary" onClick={handleReset}>
            초기화
          </button>
        </div>
      </form>

      <div className="controls consult-controls">
        <button type="button" onClick={handleConsult} disabled={!isValid || consulting}>
          {consulting ? 'AI가 분석 중...' : '🧑‍🎨 AI 스타일 컨설팅 받기'}
        </button>
      </div>

      {consultError && <div className="consult-error">{consultError}</div>}

      {report && (
        <div className="report-card">
          <h2>스타일 컨설팅 보고서</h2>
          <ReportView markdown={report} />
        </div>
      )}

      <footer>입력한 정보는 이 기기의 브라우저에만 저장됩니다 🔒</footer>
    </div>
  )
}

export default App
