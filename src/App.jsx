import { useCallback, useEffect, useState } from 'react'
import { loadData, saveData } from './lib/data'
import { formatDateLabel, todayISO, formatMoney } from './lib/utils'
import { netSavings } from './lib/stats'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadRemoteData, saveRemoteData } from './lib/remote'
import BottomNav from './components/BottomNav'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Accounts from './pages/Accounts'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠', component: Dashboard },
  { id: 'history', label: 'History', emoji: '🕒', component: History },
  { id: 'budgets', label: 'Budgets', emoji: '💰', component: Budgets },
  { id: 'goals', label: 'Goals', emoji: '🎯', component: Goals },
  { id: 'accounts', label: 'Accounts', emoji: '🏦', component: Accounts },
  { id: 'reports', label: 'Reports', emoji: '📈', component: Reports },
  { id: 'settings', label: 'Settings', emoji: '⚙️', component: Settings },
]

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [page, setPage] = useState('dashboard')
  const [moreOpen, setMoreOpen] = useState(false)
  const [authState, setAuthState] = useState('loading') // 'loading' | 'signedIn' | 'signedOut'
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)

  const updateData = useCallback((fn) => {
    setData((prev) => (typeof fn === 'function' ? fn(prev) : fn))
  }, [])

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme || 'light'
  }, [data.settings.theme])

  // Sync data to Supabase while signed in (debounced).
  useEffect(() => {
    if (authState !== 'signedIn' || !user) return
    const t = setTimeout(() => {
      saveRemoteData(user.id, data)
    }, 1200)
    return () => clearTimeout(t)
  }, [data, authState, user])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthState('signedOut')
      return
    }
    const loadSession = (session) => {
      setAuthState(session ? 'signedIn' : 'signedOut')
      setUser(session?.user || null)
      if (session) {
        loadRemoteData(session.user.id).then((remote) => {
          if (remote) {
            setData(remote)
            saveData(remote)
          }
          // Fill profile name from Supabase metadata if not set locally.
          const metaName = session.user?.user_metadata?.name
          if (metaName) {
            setData((prev) => {
              if (prev.profile?.name) return prev
              return { ...prev, profile: { ...(prev.profile || {}), name: metaName } }
            })
          }
        })
      }
    }
    supabase.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'initializing') return
      loadSession(session)
    })
    return () => sub?.unsubscribe?.()
  }, [])

  const signUp = useCallback(async ({ email, password, name }) => {
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { name } : {} },
      })
      if (error) throw error
    } catch (e) {
      setAuthError(e?.message || 'Sign up failed.')
    }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (e) {
      setAuthError(e?.message || 'Sign in failed.')
    }
  }, [])

  const signOut = useCallback(async () => {
    setAuthError(null)
    await supabase.auth.signOut().catch(() => {})
  }, [])

  if (authState === 'loading') {
    return (
      <div className="auth-screen" aria-label="Loading">
        <div className="spinner" />
      </div>
    )
  }

  if (authState === 'signedOut' && isSupabaseConfigured) {
    return <AuthPage signUp={signUp} signIn={signIn} error={authError} />
  }

  const ActivePage = PAGES.find((p) => p.id === page)?.component || PAGES[0].component

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <span className="brand-icon">💰</span>
          <span className="brand-name">Finora</span>
        </div>
        <div className="header-right">
          {user ? (
            <span className="user-email">Signed in: {user.email}</span>
          ) : (
            <span className="local-note">Local mode — connect Supabase for sign-in</span>
          )}
          {user && (
            <button type="button" className="secondary" onClick={signOut}>Sign out</button>
          )}
          <span className="today">{formatDateLabel(todayISO(), data.settings)}</span>
          <span className="net-total" title="Total net savings (all time)">
            Net total: {formatMoney(netSavings(data, null), data.settings)}
          </span>
        </div>
      </header>
      <BottomNav page={page} onSelect={setPage} onAdd={() => setPage('dashboard')} onMore={() => setMoreOpen(true)} />
      <div className="main">
        <ActivePage data={data} onDataChange={updateData} onNavigate={setPage} />
      </div>
      {moreOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setMoreOpen(false)}>
          <div className="modal modal-more" role="dialog" aria-modal="true">
            <h3 className="modal-more-title">More</h3>
            <div className="more-list">
              {PAGES.filter((p) => !['dashboard', 'history', 'accounts'].includes(p.id)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="more-item"
                  onClick={() => {
                    setMoreOpen(false)
                    setPage(p.id)
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
              {user && (
                <button
                  type="button"
                  className="more-item more-item-danger"
                  onClick={() => {
                    setMoreOpen(false)
                    signOut()
                  }}
                >
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setMoreOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
