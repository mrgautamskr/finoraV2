const INSTA_NAV = [
  { id: 'dashboard', label: 'Home', emoji: '🏠' },
  { id: 'history', label: 'Transactions', emoji: '🕒' },
  { id: 'accounts', label: 'Accounts', emoji: '🏦' },
]

export default function BottomNav({ page, onSelect, onAdd, onMore }) {
  return (
    <nav className="nav" aria-label="Primary navigation">
      {INSTA_NAV.map((p) => (
        <button key={p.id} type="button" className={page === p.id ? 'active' : ''} onClick={() => onSelect(p.id)}>
          {p.emoji} {p.label}
        </button>
      ))}
      <div className="nav-center">
        <button type="button" className="nav-add" aria-label="Add" onClick={onAdd}>
          +
        </button>
      </div>
      <button type="button" onClick={onMore}>
        ⋯ More
      </button>
    </nav>
  )
}
