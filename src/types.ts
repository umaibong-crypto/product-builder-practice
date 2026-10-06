export interface StyleProfile {
  photo: string | null // data URL
  heightCm: number | null
  weightKg: number | null
}

export const EMPTY_PROFILE: StyleProfile = {
  photo: null,
  heightCm: null,
  weightKg: null,
}

export function calcBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return '저체중'
  if (bmi < 23) return '정상'
  if (bmi < 25) return '과체중'
  return '비만'
}
