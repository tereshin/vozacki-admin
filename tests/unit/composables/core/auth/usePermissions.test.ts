import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePermissions } from '~/composables/core/auth/usePermissions'

// Заглушки реактивности
vi.stubGlobal('computed', (getter:any)=>({value:getter()}))
vi.stubGlobal('ref', (v:any)=>({value:v}))

let userRef: any

const makeUser = (code:string, name:string='Role')=>({ id:'1', role:{ code, name } })

const setupAuthStoreMock = (roleCode: string | null) => {
  userRef = { value: roleCode ? makeUser(roleCode) : null }
  vi.mock('~/store/auth', () => ({
    useAuthStore: () => ({})
  }))

  // Мокаем pinia, чтобы вернуть storeToRefs
  vi.mock('pinia', () => ({
    storeToRefs: () => ({ user: userRef })
  }))

  // Также добавляем глобальный стаб, т.к. auto-import может использовать глобальную переменную
  vi.stubGlobal('storeToRefs', () => ({ user: userRef }))
}

describe('usePermissions', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('computed', (g:any)=>({value:g()}))
    vi.stubGlobal('ref',(v:any)=>({value:v}))
  })

  it('распознаёт администратора', () => {
    setupAuthStoreMock('administrator')
    const perms = usePermissions()
    expect(perms.isAdministrator.value).toBe(true)
    expect(perms.canManageRoles.value).toBe(true)
  })

  it('распознаёт модератора', () => {
    setupAuthStoreMock('moderator')
    const perms = usePermissions()
    expect(perms.isModerator.value).toBe(true)
    expect(perms.canManageContent.value).toBe(true)
    expect(perms.canManageRoles.value).toBe(false)
  })

  it('распознаёт гостя', () => {
    setupAuthStoreMock('guest')
    const perms = usePermissions()
    expect(perms.canViewTests.value).toBe(true)
    expect(perms.canManageContent.value).toBe(false)
  })

  it('без пользователя все права false', () => {
    setupAuthStoreMock(null)
    const perms = usePermissions()
    expect(perms.isAdministrator.value).toBe(false)
    expect(perms.canManageRoles.value).toBe(false)
  })
}) 