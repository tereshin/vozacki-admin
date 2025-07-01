import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pinia defineStore
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Vue reactivity stubs
const createRef = (v: any) => ({
  value: v,
  __v_isRef: true
})
vi.stubGlobal('ref', createRef)
vi.stubGlobal('computed', (fn: any) => createRef(fn()))
vi.stubGlobal('readonly', (v: any) => v.__v_isRef ? v : createRef(v))

// Cookie stub helper
const cookieStore: Record<string, any> = {}
vi.stubGlobal('useCookie', (key:string)=>({
  get value(){ return cookieStore[key] },
  set value(v){ cookieStore[key]=v }
}))

// navigateTo stub
vi.stubGlobal('navigateTo', vi.fn())

// LocalStorage mock
const localStorageMock=(()=>{ let store: Record<string,string>={}; return{getItem:(k:string)=>store[k]||null,setItem:(k:string,v:string)=>{store[k]=v},removeItem:(k:string)=>{delete store[k]},clear:()=>{store={}}}})()
;(global as any).localStorage=localStorageMock

// API mocks
const loginSpy=vi.fn(async (payload:any)=>({ user:{ id:'1', role:{ code:'admin', name:'Admin'} }, session:{ access_token:'token'}, error:null }))
const logoutSpy=vi.fn(async ()=>({ error:null }))
vi.stubGlobal('useAuthApi', ()=>({ login: loginSpy, logout: logoutSpy, getCurrentUser: vi.fn(), getCurrentSession: vi.fn(), getCurrentAdministrator: vi.fn()}))
vi.stubGlobal('useAdministratorsApi', ()=>({ getSingleAdministrator: vi.fn(async (id:string)=>({ data:{ id, role:{ code:'admin', name:'Admin'} } })) }))

import { useAuthStore } from '~/store/auth'

describe('useAuthStore', () => {
  let store: ReturnType<typeof useAuthStore>

  beforeEach(()=>{
    vi.clearAllMocks()
    localStorageMock.clear()
    for(const k in cookieStore) delete cookieStore[k]
    store = useAuthStore()
  })

  it('login sets user and token', async () => {
    const result = await store.login({ email:'a@b.com', password:'123' } as any)
    expect(result.error).toBeUndefined()
    expect(loginSpy).toHaveBeenCalled()
    expect(cookieStore['access_token']).toBe('token')
    expect((store.user as any).value.id).toBe('1')
  })

  it('logout clears user and token', async () => {
    // first login
    await store.login({} as any)
    await store.logout()
    expect(cookieStore['access_token']).toBeNull()
    expect((store.user as any).value).toBeNull()
    expect(logoutSpy).toHaveBeenCalled()
  })
}) 