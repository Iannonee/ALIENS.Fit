import { useState, useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'

// ── Intersection Observer hook ──────────────────────────────────────────────

function useInView(threshold = 0.12): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null!)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Navbar ──────────────────────────────────────────────────────────────────

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e1e] transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(13,13,13,0.97)' : 'rgba(13,13,13,0.75)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <svg width="18" height="24" viewBox="0 0 40 52" fill="none">
            <polygon points="20,2 6,26 17,26 9,50 38,18 26,18" fill="#39ff14" />
          </svg>
          <span className="font-syne font-extrabold text-[17px] tracking-[2px] text-neon">
            ALIENSFIT
          </span>
        </Link>

        {/* Desktop center links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            ['features', 'Feature'],
            ['how', 'Come funziona'],
            ['pricing', 'Prezzi'],
          ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-[#888] hover:text-white transition-colors bg-transparent border-none cursor-pointer font-sans"
              >
                {label}
              </button>
            ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-[#888] hover:text-white transition-colors no-underline"
          >
            Accedi
          </Link>
          <Link
            to="/signup"
            className="bg-neon text-dark-900 text-sm font-bold px-4 py-2 rounded-lg font-syne hover:brightness-110 transition-all no-underline"
          >
            Inizia gratis
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-[#1e1e1e] px-5 py-5 flex flex-col gap-4">
          {[
            ['features', 'Feature'],
            ['how', 'Come funziona'],
            ['pricing', 'Prezzi'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-left text-[#888] hover:text-white transition-colors bg-transparent border-none text-[15px] cursor-pointer font-sans"
            >
              {label}
            </button>
          ))}
          <hr className="border-[#1e1e1e]" />
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="text-[#e0e0e0] text-[15px] no-underline"
          >
            Accedi
          </Link>
          <Link
            to="/signup"
            onClick={() => setOpen(false)}
            className="bg-neon text-dark-900 font-bold text-[15px] py-3 rounded-xl text-center font-syne no-underline hover:brightness-110 transition-all"
          >
            Inizia gratis
          </Link>
        </div>
      )}
    </nav>
  )
}

// ── Phone mockups ───────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[155px] flex-shrink-0 bg-[#111] border border-[#2a2a2a] rounded-[26px] overflow-hidden shadow-2xl">
      <div className="w-10 h-[3px] bg-[#2a2a2a] rounded-full mx-auto mt-3 mb-3" />
      <div className="px-3 overflow-hidden" style={{ maxHeight: 290 }}>
        {children}
      </div>
      <div className="w-12 h-[3px] bg-[#2a2a2a] rounded-full mx-auto mt-3 mb-3" />
    </div>
  )
}

function DashboardMockup() {
  return (
    <PhoneFrame>
      <div className="space-y-2.5 pb-2">
        <div>
          <p className="text-[9px] text-[#555] font-mono tracking-wider mb-0.5">BENVENUTO</p>
          <p className="text-white text-[11px] font-bold">Ciao, Marco 👋</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[['3', 'Schede'], ['7🔥', 'Streak']].map(([v, l]) => (
            <div key={l} className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg p-1.5 text-center">
              <p className="text-neon text-sm font-bold leading-none mb-0.5">{v}</p>
              <p className="text-[8px] text-[#555]">{l}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[8px] text-[#444] mb-1.5 uppercase tracking-wider">Le tue schede</p>
          {['Full Body 3x', 'Push Pull Legs', 'Cardio Mix'].map(name => (
            <div
              key={name}
              className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1.5 mb-1 flex items-center justify-between"
            >
              <span className="text-white text-[10px]">{name}</span>
              <span className="text-neon text-[10px]">›</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}

function SessionMockup() {
  return (
    <PhoneFrame>
      <div className="space-y-2 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          <p className="text-[8px] text-neon uppercase tracking-wider font-mono">Sessione attiva</p>
        </div>
        <p className="text-white text-[11px] font-bold">Squat</p>
        <div className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg p-2">
          <div className="grid grid-cols-3 gap-1 mb-1.5">
            {['#', 'kg', 'rip'].map(h => (
              <p key={h} className="text-[7px] text-[#555] text-center">{h}</p>
            ))}
          </div>
          {[
            [1, '80', '10', true],
            [2, '80', '8', true],
            [3, '', '', false],
          ].map(([n, w, r, done]) => (
            <div
              key={String(n)}
              className={`grid grid-cols-3 gap-1 py-0.5 rounded ${done ? 'bg-neon/5' : ''}`}
            >
              <p className={`text-[8px] text-center font-mono ${done ? 'text-neon' : 'text-[#444]'}`}>{n}</p>
              <p className={`text-[8px] text-center ${done ? 'text-neon' : 'text-[#444]'}`}>{w || '—'}</p>
              <p className={`text-[8px] text-center ${done ? 'text-neon' : 'text-[#444]'}`}>{r || '—'}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1.5">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-[8px] text-[#666]">Timer riposo 90s</p>
        </div>
        <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div className="h-full bg-neon rounded-full" style={{ width: '66%' }} />
        </div>
        <p className="text-[8px] text-[#444] text-center">4 / 6 completati</p>
      </div>
    </PhoneFrame>
  )
}

function HistoryMockup() {
  return (
    <PhoneFrame>
      <div className="space-y-2 pb-2">
        <p className="text-white text-[11px] font-bold mb-1">Storico</p>
        {[
          { date: 'Oggi', sessions: ['Full Body 3x · A'] },
          { date: 'Ieri', sessions: ['Push Pull · Push'] },
          { date: '17 mag', sessions: ['Full Body 3x · B'] },
        ].map(({ date, sessions }) => (
          <div key={date}>
            <p className="text-[8px] text-[#444] uppercase tracking-wider mb-1">{date}</p>
            {sessions.map(s => (
              <div
                key={s}
                className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1.5 mb-1 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-[10px]">{s}</p>
                  <p className="text-[7px] text-[#444]">6 esercizi</p>
                </div>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PhoneFrame>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="min-h-screen bg-[#0d0d0d] flex flex-col justify-center pt-[60px]">
      <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 flex flex-col items-center text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 border border-neon/30 text-neon text-[10px] font-mono uppercase tracking-[3px] px-4 py-2 rounded-full mb-8">
            By Aliens Technology
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1
            className="text-[2.6rem] md:text-[4rem] lg:text-[5rem] font-syne font-black leading-[1.05] text-white mb-5"
            style={{ maxWidth: 740 }}
          >
            Il tuo allenamento,
            <br />
            <span className="text-neon">finalmente organizzato.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p
            className="text-[#666] text-[16px] md:text-[18px] leading-relaxed mb-10 font-dm"
            style={{ maxWidth: 500 }}
          >
            Crea le tue schede, traccia ogni sessione, e vedi i tuoi progressi nel tempo. Senza
            complicazioni.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row gap-3 mb-16">
            <Link
              to="/signup"
              className="bg-neon text-dark-900 font-bold text-[15px] px-7 py-3.5 rounded-xl font-syne hover:brightness-110 active:scale-95 transition-all no-underline"
            >
              Crea il tuo account
            </Link>
            <button
              onClick={() =>
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="border border-[#2a2a2a] text-[#e0e0e0] text-[15px] px-7 py-3.5 rounded-xl hover:bg-[#1a1a1a] hover:border-[#3a3a3a] transition-all bg-transparent cursor-pointer font-sans"
            >
              Scopri le feature
            </button>
          </div>
        </FadeIn>

        {/* Phone mockups */}
        <FadeIn delay={400} className="w-full">
          <div className="flex justify-center items-end gap-4 overflow-x-auto pb-2">
            <div
              className="opacity-60 hidden sm:block"
              style={{ transform: 'rotate(-5deg) translateY(16px)' }}
            >
              <DashboardMockup />
            </div>
            <div style={{ transform: 'scale(1.06)' }}>
              <SessionMockup />
            </div>
            <div
              className="opacity-60 hidden sm:block"
              style={{ transform: 'rotate(5deg) translateY(16px)' }}
            >
              <HistoryMockup />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
    title: 'Schede personalizzate',
    desc: 'Crea le tue schede da zero, con giorni, esercizi, serie e recuperi.',
    soon: false,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    title: 'Sessione live',
    desc: 'Timer recupero integrato, logga i pesi effettivi set per set.',
    soon: false,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Storico allenamenti',
    desc: 'Rivedi ogni sessione per data, con tutti i dati registrati.',
    soon: false,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Riscaldamento e defaticamento',
    desc: 'Aggiungi attività pre e post workout con durata e intensità.',
    soon: false,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Import da PDF',
    desc: 'Carica la scheda del tuo PT e la generiamo automaticamente con AI.',
    soon: true,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: 'Mobile first',
    desc: 'Progettato per usarlo in palestra, dal telefono, senza rotture.',
    soon: false,
  },
]

function FeatureCard({
  icon,
  title,
  desc,
  soon,
}: (typeof FEATURES)[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#111111',
        border: `1px solid ${hovered ? 'rgba(57,255,20,0.25)' : '#1e1e1e'}`,
        borderRadius: 12,
        padding: '1.5rem',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'border-color 0.25s ease, transform 0.25s ease',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center text-neon flex-shrink-0">
          {icon}
        </div>
        {soon && (
          <span className="text-[9px] font-mono tracking-wider text-[#555] border border-[#2a2a2a] px-2 py-1 rounded-full uppercase">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="text-white font-semibold text-[15px] mb-1.5 font-syne">{title}</h3>
      <p className="text-[#555] text-[13px] leading-relaxed font-dm">{desc}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-14">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">Feature</p>
          <h2 className="text-[2rem] md:text-[2.6rem] font-syne font-black text-white mb-3">
            Tutto quello che ti serve.
          </h2>
          <p className="text-[#555] text-base font-dm">Niente di più, niente di meno.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 70}>
              <FeatureCard {...f} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it works ────────────────────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Crea il tuo account', desc: '30 secondi, nessuna carta di credito.' },
  {
    n: '02',
    title: 'Costruisci la tua scheda',
    desc: 'Aggiungi giorni, esercizi, serie e recuperi come vuoi.',
  },
  {
    n: '03',
    title: 'Allenati e traccia',
    desc: 'Apri la sessione, logga i pesi, guarda i progressi.',
  },
]

function StepCard({ n, title, desc }: (typeof STEPS)[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex flex-col items-center text-center md:items-start md:text-left"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="text-[3.5rem] font-black font-syne mb-4 leading-none transition-all duration-300 select-none"
        style={{
          color: hovered ? '#39ff14' : '#222',
          textShadow: hovered ? '0 0 24px rgba(57,255,20,0.35)' : 'none',
        }}
      >
        {n}
      </div>
      <h3 className="text-white font-bold text-[17px] mb-2 font-syne">{title}</h3>
      <p className="text-[#555] text-[14px] leading-relaxed font-dm">{desc}</p>
    </div>
  )
}

function HowSection() {
  return (
    <section id="how" className="bg-[#111] py-20 md:py-28 border-y border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-14">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">
            Come funziona
          </p>
          <h2 className="text-[2rem] md:text-[2.6rem] font-syne font-black text-white">
            Da zero all'allenamento in 3 passi.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Dashed connector (desktop) */}
          <div className="hidden md:block absolute top-7 left-[calc(16.5%+20px)] right-[calc(16.5%+20px)] h-px border-t border-dashed border-neon/20" />
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 120}>
              <StepCard {...s} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ─────────────────────────────────────────────────────────────────

const INCLUDED = [
  'Schede illimitate',
  'Sessioni illimitate',
  'Storico completo',
  'Timer recupero',
  'Riscaldamento e defaticamento',
]
const COMING_SOON = ['Import da PDF con AI']

function PricingSection() {
  return (
    <section id="pricing" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-12">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">Prezzi</p>
          <h2 className="text-[2rem] md:text-[2.6rem] font-syne font-black text-white mb-3">
            Gratis. Davvero.
          </h2>
          <p className="text-[#555] text-base font-dm max-w-md mx-auto">
            AliensFit è gratuito. In futuro arriveranno feature premium, ma il core resterà free.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-sm mx-auto bg-[#111] border border-[#1e1e1e] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-syne font-bold text-lg">Free</span>
              <span className="text-[9px] font-mono text-neon border border-neon/30 px-2 py-1 rounded-full uppercase tracking-wider">
                Attivo ora
              </span>
            </div>
            <div className="mb-7">
              <span className="text-[2.5rem] font-black font-syne text-neon">€0</span>
              <span className="text-[#555] text-sm ml-1 font-dm">/ mese</span>
            </div>

            <div className="flex flex-col gap-3 mb-7">
              {INCLUDED.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="2.5"
                    className="flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#e0e0e0] text-sm font-dm">{f}</span>
                </div>
              ))}
              {COMING_SOON.map(f => (
                <div key={f} className="flex items-center gap-3 opacity-35">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#555"
                    strokeWidth="2"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[#555] text-sm font-dm">{f}</span>
                </div>
              ))}
            </div>

            <Link
              to="/signup"
              className="block w-full bg-neon text-dark-900 font-bold text-[15px] py-3 rounded-xl text-center font-syne hover:brightness-110 transition-all no-underline"
            >
              Inizia gratis
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Final CTA ───────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-5">
        <FadeIn>
          <div className="border border-neon/20 bg-[#111] rounded-2xl p-10 text-center">
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-syne font-black text-white mb-3">
              Pronto a smettere di allenarti a caso?
            </h2>
            <p className="text-[#555] text-base mb-8 font-dm">
              Gratis. Nessuna carta di credito. Ci vogliono 30 secondi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="bg-neon text-dark-900 font-bold text-[15px] px-7 py-3.5 rounded-xl font-syne hover:brightness-110 transition-all no-underline"
              >
                Crea il tuo account
              </Link>
              <Link
                to="/login"
                className="border border-[#2a2a2a] text-[#e0e0e0] text-[15px] px-7 py-3.5 rounded-xl hover:bg-[#1a1a1a] transition-all no-underline"
              >
                Ho già un account
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Footer ──────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-[#1e1e1e] py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-syne font-black text-neon text-base tracking-widest">ALIENSFIT</span>
          <span className="text-[#333] text-[11px] font-mono uppercase tracking-wider">
            Track your gains
          </span>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-[#444]">
          <a href="#" className="hover:text-[#888] transition-colors no-underline">
            Privacy
          </a>
          <a href="#" className="hover:text-[#888] transition-colors no-underline">
            Termini
          </a>
          <a href="#" className="hover:text-[#888] transition-colors no-underline">
            Contatti
          </a>
        </div>
        <p className="text-[#333] text-[12px] font-dm">© 2025 Aliens Technology</p>
      </div>
    </footer>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="font-dm">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowSection />
      <PricingSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
