export const SET_COUNT = 5
export const NUMBERS_PER_SET = 6
export const MIN_NUMBER = 1
export const MAX_NUMBER = 45

export type LottoSet = number[]

function generateOneSet(): LottoSet {
  const nums = new Set<number>()
  while (nums.size < NUMBERS_PER_SET) {
    nums.add(Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

export function generateLottoSets(count: number = SET_COUNT): LottoSet[] {
  return Array.from({ length: count }, generateOneSet)
}

export function colorClass(n: number): string {
  if (n <= 10) return 'c1'
  if (n <= 20) return 'c2'
  if (n <= 30) return 'c3'
  if (n <= 40) return 'c4'
  return 'c5'
}
