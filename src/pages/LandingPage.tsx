import { useState, useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ── Utilities ───────────────────────────────────────────────────────────────

function useInView(threshold = 0.1): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null!)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold, rootMargin: '0px 0px 50px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : 'translateY(18px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Navbar ──────────────────────────────────────────────────────────────────

function LandingNavbar() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinks = [['features', 'Feature'], ['how', 'Come funziona'], ['pricing', 'Prezzi']]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e1e] transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(13,13,13,0.97)' : 'rgba(13,13,13,0.8)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <svg width="16" height="22" viewBox="0 0 40 52" fill="none">
            <polygon points="20,2 6,26 17,26 9,50 38,18 26,18" fill="#39ff14" />
          </svg>
          <span className="font-syne font-extrabold text-[16px] sm:text-[17px] tracking-[2px] text-neon">ALIENSFIT</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="text-sm text-[#777] hover:text-white transition-colors bg-transparent border-none cursor-pointer whitespace-nowrap">
              {label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link to="/dashboard"
              className="bg-neon text-dark-900 text-sm font-bold px-5 py-2 rounded-lg font-syne hover:brightness-110 transition-all no-underline whitespace-nowrap">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#777] hover:text-white transition-colors no-underline">Accedi</Link>
              <Link to="/signup"
                className="bg-neon text-dark-900 text-sm font-bold px-4 py-2 rounded-lg font-syne hover:brightness-110 transition-all no-underline">
                Inizia gratis
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 bg-transparent border-none cursor-pointer" onClick={() => setOpen(!open)}>
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1e1e1e] px-4 py-5 flex flex-col gap-4">
          {navLinks.map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="text-left text-[#888] hover:text-white transition-colors bg-transparent border-none text-[15px] cursor-pointer py-1">
              {label}
            </button>
          ))}
          <div className="border-t border-[#1e1e1e] pt-4 flex flex-col gap-3">
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}
                className="bg-neon text-dark-900 font-bold text-[15px] py-3.5 rounded-xl text-center font-syne no-underline">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-[#e0e0e0] text-[15px] no-underline py-1">Accedi</Link>
                <Link to="/signup" onClick={() => setOpen(false)}
                  className="bg-neon text-dark-900 font-bold text-[15px] py-3.5 rounded-xl text-center font-syne no-underline">
                  Inizia gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ── Phone mockups ───────────────────────────────────────────────────────────

function Phone({ children, w = 150 }: { children: React.ReactNode; w?: number }) {
  return (
    <div className="flex-shrink-0 bg-[#111] border border-[#2a2a2a] rounded-[22px] overflow-hidden shadow-2xl" style={{ width: w }}>
      <div className="w-9 h-[3px] bg-[#2a2a2a] rounded-full mx-auto mt-3 mb-2" />
      <div className="px-3" style={{ maxHeight: w * 1.85, overflow: 'hidden' }}>{children}</div>
      <div className="w-11 h-[3px] bg-[#2a2a2a] rounded-full mx-auto mt-2 mb-3" />
    </div>
  )
}

function DashboardPhone({ w = 150 }: { w?: number }) {
  const f = (n: number) => `${(n * w) / 150}px`
  return (
    <Phone w={w}>
      <div className="space-y-2 pb-1">
        <div>
          <p style={{ fontSize: f(8.5) }} className="text-[#555] font-mono tracking-wider mb-0.5">BENVENUTO</p>
          <p style={{ fontSize: f(11) }} className="text-white font-bold">Ciao, Marco 👋</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[['3', 'Schede'], ['7🔥', 'Streak']].map(([v, l]) => (
            <div key={l} className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg p-1.5 text-center">
              <p style={{ fontSize: f(13) }} className="text-neon font-bold leading-none mb-0.5">{v}</p>
              <p style={{ fontSize: f(8) }} className="text-[#555]">{l}</p>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: f(8) }} className="text-[#444] mb-1.5 uppercase tracking-wider">Le tue schede</p>
          {['Full Body 3x', 'Push Pull Legs', 'Cardio Mix'].map(n => (
            <div key={n} className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1.5 mb-1 flex justify-between items-center">
              <span style={{ fontSize: f(10) }} className="text-white">{n}</span>
              <span style={{ fontSize: f(10) }} className="text-neon">›</span>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  )
}

function SessionPhone({ w = 150 }: { w?: number }) {
  const f = (n: number) => `${(n * w) / 150}px`
  return (
    <Phone w={w}>
      <div className="space-y-2 pb-1">
        <div className="flex items-center gap-1.5">
          <div className="rounded-full bg-neon animate-pulse" style={{ width: f(5), height: f(5) }} />
          <p style={{ fontSize: f(8) }} className="text-neon uppercase tracking-wider font-mono">Sessione attiva</p>
        </div>
        <p style={{ fontSize: f(11) }} className="text-white font-bold">Squat</p>
        <div className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg p-1.5">
          <div className="grid grid-cols-3 gap-1 mb-1">
            {['#', 'kg', 'rip'].map(h => <p key={h} style={{ fontSize: f(7) }} className="text-[#555] text-center">{h}</p>)}
          </div>
          {[[1, '80', '10', true], [2, '80', '8', true], [3, '—', '—', false]].map(([n, w2, r, done]) => (
            <div key={String(n)} className={`grid grid-cols-3 gap-1 py-0.5 rounded ${done ? 'bg-neon/5' : ''}`}>
              <p style={{ fontSize: f(8) }} className={`text-center font-mono ${done ? 'text-neon' : 'text-[#444]'}`}>{n}</p>
              <p style={{ fontSize: f(8) }} className={`text-center ${done ? 'text-neon' : 'text-[#444]'}`}>{w2}</p>
              <p style={{ fontSize: f(8) }} className={`text-center ${done ? 'text-neon' : 'text-[#444]'}`}>{r}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1">
          <svg width={f(8)} height={f(8)} viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p style={{ fontSize: f(8) }} className="text-[#666]">Timer riposo 90s</p>
        </div>
        <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div className="h-full bg-neon rounded-full" style={{ width: '66%' }} />
        </div>
        <p style={{ fontSize: f(8) }} className="text-[#444] text-center">4 / 6 completati</p>
      </div>
    </Phone>
  )
}

function HistoryPhone({ w = 150 }: { w?: number }) {
  const f = (n: number) => `${(n * w) / 150}px`
  return (
    <Phone w={w}>
      <div className="space-y-2 pb-1">
        <p style={{ fontSize: f(11) }} className="text-white font-bold mb-1">Storico</p>
        {[
          { date: 'Oggi', items: ['Full Body 3x · A'] },
          { date: 'Ieri', items: ['Push Pull · Push'] },
          { date: '17 mag', items: ['Full Body 3x · B'] },
        ].map(({ date, items }) => (
          <div key={date}>
            <p style={{ fontSize: f(8) }} className="text-[#444] uppercase tracking-wider mb-1">{date}</p>
            {items.map(s => (
              <div key={s} className="bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg px-2 py-1.5 mb-1 flex justify-between items-center">
                <div>
                  <p style={{ fontSize: f(10) }} className="text-white">{s}</p>
                  <p style={{ fontSize: f(7.5) }} className="text-[#444]">6 esercizi</p>
                </div>
                <svg width={f(9)} height={f(9)} viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Phone>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="bg-[#0d0d0d] pt-[60px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-0 lg:min-h-[calc(100svh-60px)] lg:flex lg:items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

          {/* Text column */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <FadeIn>
              <div className="inline-flex items-center gap-2 border border-neon/30 text-neon text-[10px] font-mono uppercase tracking-[3px] px-4 py-2 rounded-full mb-7">
                By Aliens Technology
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="font-syne font-black leading-[1.05] text-white mb-5 text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.2rem] xl:text-[3.8rem]">
                Il tuo allenamento,<br />
                <span className="text-neon">finalmente organizzato.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="text-[#666] text-base sm:text-[17px] lg:text-[18px] leading-relaxed mb-9 font-dm max-w-[500px]">
                Crea le tue schede, traccia ogni sessione, e vedi i tuoi progressi nel tempo. Senza complicazioni.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {user ? (
                  <Link to="/dashboard"
                    className="bg-neon text-dark-900 font-bold text-[15px] px-8 py-3.5 rounded-xl font-syne hover:brightness-110 active:scale-95 transition-all no-underline text-center">
                    Vai alla dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/signup"
                      className="bg-neon text-dark-900 font-bold text-[15px] px-8 py-3.5 rounded-xl font-syne hover:brightness-110 active:scale-95 transition-all no-underline text-center">
                      Crea il tuo account
                    </Link>
                    <button
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border border-[#2a2a2a] text-[#e0e0e0] text-[15px] px-8 py-3.5 rounded-xl hover:bg-[#1a1a1a] hover:border-[#3a3a3a] transition-all bg-transparent cursor-pointer">
                      Scopri le feature
                    </button>
                  </>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Phones column */}
          <FadeIn delay={300} className="flex justify-center lg:justify-center xl:justify-end">
            {/* Mobile only: single center phone, bigger */}
            <div className="sm:hidden">
              <SessionPhone w={190} />
            </div>

            {/* sm–lg: three phones, medium size */}
            <div className="hidden sm:flex lg:hidden items-end gap-4">
              <div className="opacity-50" style={{ transform: 'rotate(-4deg) translateY(14px)' }}>
                <DashboardPhone w={138} />
              </div>
              <SessionPhone w={160} />
              <div className="opacity-50" style={{ transform: 'rotate(4deg) translateY(14px)' }}>
                <HistoryPhone w={138} />
              </div>
            </div>

            {/* lg+: three phones, full size */}
            <div className="hidden lg:flex items-end gap-4 xl:gap-5">
              <div className="opacity-50" style={{ transform: 'rotate(-4deg) translateY(16px)' }}>
                <DashboardPhone w={148} />
              </div>
              <SessionPhone w={168} />
              <div className="opacity-50" style={{ transform: 'rotate(4deg) translateY(16px)' }}>
                <HistoryPhone w={148} />
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}

// ── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
    title: 'Schede personalizzate',
    desc: 'Crea le tue schede da zero, con giorni, esercizi, serie e recuperi.',
    soon: false,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    title: 'Sessione live',
    desc: 'Timer recupero integrato, logga i pesi effettivi set per set.',
    soon: false,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Storico allenamenti',
    desc: 'Rivedi ogni sessione per data, con tutti i dati registrati.',
    soon: false,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Riscaldamento e defaticamento',
    desc: 'Aggiungi attività pre e post workout con durata e intensità.',
    soon: false,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    title: 'Import da PDF',
    desc: 'Carica la scheda del tuo PT e la generiamo automaticamente con AI.',
    soon: true,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    title: 'Mobile first',
    desc: 'Progettato per usarlo in palestra, dal telefono, senza rotture.',
    soon: false,
  },
]

function FeatureCard({ icon, title, desc, soon }: (typeof FEATURES)[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-full"
      style={{
        backgroundColor: '#111',
        border: `1px solid ${hovered ? 'rgba(57,255,20,0.22)' : '#1e1e1e'}`,
        borderRadius: 12,
        padding: '1.5rem',
        transform: hovered ? 'scale(1.015)' : 'scale(1)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center text-neon flex-shrink-0">{icon}</div>
        {soon && <span className="text-[9px] font-mono tracking-wider text-[#555] border border-[#2a2a2a] px-2 py-1 rounded-full uppercase">Coming soon</span>}
      </div>
      <h3 className="text-white font-semibold text-[15px] mb-1.5 font-syne">{title}</h3>
      <p className="text-[#555] text-[13px] leading-relaxed font-dm">{desc}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-12 md:mb-16">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">Feature</p>
          <h2 className="text-[1.9rem] sm:text-[2.4rem] md:text-[2.6rem] font-syne font-black text-white mb-3">Tutto quello che ti serve.</h2>
          <p className="text-[#555] text-base font-dm">Niente di più, niente di meno.</p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60} className="flex">
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
  { n: '02', title: 'Costruisci la tua scheda', desc: 'Aggiungi giorni, esercizi, serie e recuperi come vuoi.' },
  { n: '03', title: 'Allenati e traccia', desc: 'Apri la sessione, logga i pesi, guarda i progressi.' },
]

function StepCard({ n, title, desc }: (typeof STEPS)[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="flex flex-row md:flex-col gap-5 md:gap-0 items-start"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="text-[2.8rem] md:text-[3.5rem] font-black font-syne leading-none select-none transition-all duration-300 flex-shrink-0"
        style={{ color: hovered ? '#39ff14' : '#222', textShadow: hovered ? '0 0 24px rgba(57,255,20,0.3)' : 'none' }}>
        {n}
      </div>
      <div className="md:mt-4">
        <h3 className="text-white font-bold text-[16px] sm:text-[17px] mb-1.5 font-syne">{title}</h3>
        <p className="text-[#555] text-[14px] leading-relaxed font-dm">{desc}</p>
      </div>
    </div>
  )
}

function HowSection() {
  return (
    <section id="how" className="bg-[#111] py-20 md:py-28 border-y border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-12 md:mb-16">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">Come funziona</p>
          <h2 className="text-[1.9rem] sm:text-[2.4rem] md:text-[2.6rem] font-syne font-black text-white">
            Da zero all'allenamento in 3 passi.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
          <div className="hidden md:block absolute top-7 left-[calc(16.5%+20px)] right-[calc(16.5%+20px)] h-px border-t border-dashed border-neon/20" />
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 100}><StepCard {...s} /></FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ─────────────────────────────────────────────────────────────────

const INCLUDED = ['Schede illimitate', 'Sessioni illimitate', 'Storico completo', 'Timer recupero', 'Riscaldamento e defaticamento']
const SOON_ITEMS = ['Import da PDF con AI']

function PricingSection() {
  const { user } = useAuth()
  return (
    <section id="pricing" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-12">
          <p className="text-neon text-[11px] font-mono uppercase tracking-[4px] mb-3">Prezzi</p>
          <h2 className="text-[1.9rem] sm:text-[2.4rem] md:text-[2.6rem] font-syne font-black text-white mb-3">Gratis. Davvero.</h2>
          <p className="text-[#555] text-base font-dm max-w-md mx-auto">
            AliensFit è gratuito. In futuro arriveranno feature premium, ma il core resterà free.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-[360px] mx-auto bg-[#111] border border-[#1e1e1e] rounded-2xl p-7 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-syne font-bold text-lg">Free</span>
              <span className="text-[9px] font-mono text-neon border border-neon/30 px-2 py-1 rounded-full uppercase tracking-wider">Attivo ora</span>
            </div>
            <div className="mb-6">
              <span className="text-[2.4rem] font-black font-syne text-neon">€0</span>
              <span className="text-[#555] text-sm ml-1 font-dm">/ mese</span>
            </div>

            <div className="flex flex-col gap-2.5 mb-7">
              {INCLUDED.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[#e0e0e0] text-sm font-dm">{f}</span>
                </div>
              ))}
              {SOON_ITEMS.map(f => (
                <div key={f} className="flex items-center gap-3 opacity-35">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-[#555] text-sm font-dm">{f}</span>
                </div>
              ))}
            </div>

            {user ? (
              <Link to="/dashboard"
                className="block w-full bg-neon text-dark-900 font-bold text-[15px] py-3 rounded-xl text-center font-syne hover:brightness-110 transition-all no-underline">
                Vai alla dashboard →
              </Link>
            ) : (
              <Link to="/signup"
                className="block w-full bg-neon text-dark-900 font-bold text-[15px] py-3 rounded-xl text-center font-syne hover:brightness-110 transition-all no-underline">
                Inizia gratis
              </Link>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Final CTA ───────────────────────────────────────────────────────────────

function CTASection() {
  const { user } = useAuth()
  return (
    <section className="bg-[#0d0d0d] py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="border border-neon/20 bg-[#111] rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="text-[1.6rem] sm:text-[1.9rem] md:text-[2.2rem] font-syne font-black text-white mb-3">
              Pronto a smettere di allenarti a caso?
            </h2>
            <p className="text-[#555] text-base mb-8 font-dm">Gratis. Nessuna carta di credito. Ci vogliono 30 secondi.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to="/dashboard"
                  className="bg-neon text-dark-900 font-bold text-[15px] px-8 py-3.5 rounded-xl font-syne hover:brightness-110 transition-all no-underline">
                  Vai alla dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/signup"
                    className="bg-neon text-dark-900 font-bold text-[15px] px-8 py-3.5 rounded-xl font-syne hover:brightness-110 transition-all no-underline">
                    Crea il tuo account
                  </Link>
                  <Link to="/login"
                    className="border border-[#2a2a2a] text-[#e0e0e0] text-[15px] px-8 py-3.5 rounded-xl hover:bg-[#1a1a1a] transition-all no-underline">
                    Ho già un account
                  </Link>
                </>
              )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-syne font-black text-neon text-[15px] tracking-widest">ALIENSFIT</span>
          <span className="text-[#333] text-[11px] font-mono uppercase tracking-wider">Track your gains</span>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-[#444]">
          <a href="#" className="hover:text-[#888] transition-colors no-underline">Privacy</a>
          <a href="#" className="hover:text-[#888] transition-colors no-underline">Termini</a>
          <a href="#" className="hover:text-[#888] transition-colors no-underline">Contatti</a>
        </div>
        <p className="text-[#333] text-[12px] font-dm">© 2025 Aliens Technology</p>
      </div>
    </footer>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="font-dm" style={{ overflowX: 'hidden' }}>
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
