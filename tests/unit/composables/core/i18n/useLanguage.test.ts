import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLanguage } from '~/composables/core/i18n/useLanguage'
import { availableLanguages } from '~/i18n/i18n'

let localeRef: any
let setLocaleSpy: any

// Заглушки реактивности
vi.stubGlobal('computed', (getter:any)=>({value:getter()}))
vi.stubGlobal('ref', (v:any)=>({value:v}))

// Мокаем useI18n
const mockUseI18n = () => {
  localeRef = { value: 'en' }
  setLocaleSpy = vi.fn(async (l)=>{ localeRef.value = l })
  vi.stubGlobal('useI18n', () => ({ locale: localeRef, setLocale: setLocaleSpy }))
}

describe('useLanguage', () => {
  beforeEach(() => {
    vi.resetModules()
    mockUseI18n()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    vi.stubGlobal('computed', (g:any)=>({value:g()}))
    vi.stubGlobal('ref',(v:any)=>({value:v}))
  })

  it('currentLanguage возвращает текущее значение locale', () => {
    const { currentLanguage } = useLanguage()
    expect(currentLanguage.value).toBe('en')
  })

  it('changeLanguage вызывает setLocale для поддерживаемого кода', async () => {
    const { changeLanguage } = useLanguage()
    await changeLanguage('ru')
    expect(setLocaleSpy).toHaveBeenCalledWith('ru')
  })

  it('changeLanguage не вызывает setLocale для неподдерживаемого кода', async () => {
    const { changeLanguage } = useLanguage()
    await changeLanguage('xx')
    expect(setLocaleSpy).not.toHaveBeenCalledWith('xx')
  })

  it('getLanguageFlag и Name возвращают корректные значения', () => {
    const { getLanguageFlag, getLanguageName } = useLanguage()
    const sample = availableLanguages[0]
    expect(getLanguageFlag(sample.code)).toBe(sample.flag)
    expect(getLanguageName(sample.code)).toBe(sample.localName)
  })
}) 