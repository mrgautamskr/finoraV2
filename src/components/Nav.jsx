export default function Nav({ pages, page, onSelect }) {
  return (
    <nav className="nav" aria-label="Primary navigation">
      {pages.map((p) => (
        <button key={p.id} type="button" className={page === p.id ? 'active' : ''} onClick={() => onSelect(p.id)}>
          {p.emoji} {p.label}
        </button>
      ))}
    </nav>
  )
}
