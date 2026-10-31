import {
  createLanToken,
  isValidLanToken,
  normalizeLanAddress,
} from '../../src/features/backup/lan'

describe('LAN transfer address', () => {
  it('normalizes a host and port into an http origin', () => {
    expect(normalizeLanAddress('192.168.1.8:8080')).toBe(
      'http://192.168.1.8:8080',
    )
    expect(normalizeLanAddress(' http://192.168.1.8:8080/ ')).toBe(
      'http://192.168.1.8:8080',
    )
  })

  it('rejects an empty or malformed address', () => {
    expect(() => normalizeLanAddress('   ')).toThrow('请输入接收地址')
    expect(() => normalizeLanAddress('http://')).toThrow('接收地址格式不正确')
    expect(() => normalizeLanAddress('192.168.1.8/path')).toThrow(
      '接收地址格式不正确',
    )
  })

  it('rejects https because LAN transfer uses http', () => {
    expect(() => normalizeLanAddress('https://192.168.1.8:8080')).toThrow(
      '局域网传输只支持 http 地址',
    )
  })

  it('generates a valid six digit one-time token', () => {
    const token = createLanToken()
    expect(isValidLanToken(token)).toBe(true)
    expect(isValidLanToken('12345')).toBe(false)
    expect(isValidLanToken('1234567')).toBe(false)
    expect(isValidLanToken('12345a')).toBe(false)
  })
})
