const ASCII_A = 'A'.charCodeAt(0)
const ALPHA_NUM = 26
const CODE_BIT = 6
const ALPHA_MAX = ALPHA_NUM ** CODE_BIT

export function genCode(): string {
  let code = ''
  let sixBitNumber = Math.floor(Math.random() * ALPHA_MAX)
  for (let i = 0; i < CODE_BIT; i++) {
    const bit = sixBitNumber % ALPHA_NUM
    code += String.fromCharCode(ASCII_A + bit)
    sixBitNumber = Math.floor(sixBitNumber / ALPHA_NUM)
  }
  return code
}

export function checkCode(code: string): boolean {
  return /^[A-Z]{6}$/.test(code)
}
