import { useState } from 'react'
import './App.css'
import { colorClass, generateLottoSets, type LottoSet } from './lotto'

function App() {
  const [sets, setSets] = useState<LottoSet[]>(() => generateLottoSets())

  return (
    <div className="wrap">
      <h1>🎱 로또 번호 추천기</h1>
      <p className="subtitle">
        버튼을 누르면 5세트의 번호를 무작위로 추천해드려요 (행운을 빌어요!)
      </p>

      <div className="controls">
        <button type="button" onClick={() => setSets(generateLottoSets())}>
          번호 추천받기
        </button>
        <button type="button" className="secondary" onClick={() => setSets([])}>
          초기화
        </button>
      </div>

      <div className="sets">
        {sets.map((nums, i) => (
          <div className="set" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="label">{i + 1}세트</div>
            <div className="balls">
              {nums.map((n) => (
                <div className={`ball ${colorClass(n)}`} key={n}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer>본 추천은 무작위 생성이며 당첨을 보장하지 않습니다 🍀</footer>
    </div>
  )
}

export default App
