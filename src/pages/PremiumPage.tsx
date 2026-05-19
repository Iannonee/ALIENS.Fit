import { Navbar } from '../components/layout/Navbar'
import { BottomNav } from '../components/layout/BottomNav'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Importa da PDF',
    description: 'Carica la tua scheda di allenamento in formato PDF e l\'AI la convertirà automaticamente in esercizi strutturati.',
    comingSoon: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Analisi avanzate',
    description: 'Statistiche dettagliate sui tuoi allenamenti, progressi nel tempo e raccomandazioni personalizzate.',
    comingSoon: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
      </svg>
    ),
    title: 'AI Coach personale',
    description: 'Ricevi suggerimenti personalizzati basati sulla tua cronologia di allenamento e obiettivi.',
    comingSoon: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Schede community',
    description: 'Accedi a centinaia di schede create da professionisti del fitness e condividi le tue.',
    comingSoon: true,
  },
]

export function PremiumPage() {

  return (
    <div className="min-h-screen bg-dark-900 pb-24 md:pb-8 md:pt-14">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="relative bg-dark-800 border border-neon/20 rounded-3xl p-6 mb-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-neon/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-neon/5 blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-neon/30 flex items-center justify-center shadow-neon overflow-hidden">
                <img src="/logo.svg" alt="AliensFit" className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">AliensFit</h1>
                  <Badge variant="neon">Premium</Badge>
                </div>
                <p className="text-xs text-gray-500">Sblocca il tuo potenziale alieno</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Porta il tuo allenamento al livello successivo con funzionalità avanzate
              alimentate dall'intelligenza artificiale.
            </p>

            <div className="flex items-end gap-1 mb-5">
              <span className="text-4xl font-bold text-neon">€9.99</span>
              <span className="text-gray-500 text-sm mb-1.5">/mese</span>
            </div>

            <Button variant="primary" size="lg" className="w-full" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Presto disponibile
            </Button>
          </div>
        </div>

        {/* Features */}
        <h2 className="text-base font-bold text-white mb-4">Funzionalità Premium</h2>

        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-dark-800 border border-dark-700 rounded-2xl p-5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0 text-neon">
                {feature.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  {feature.comingSoon && (
                    <Badge variant="coming-soon">In arrivo</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PDF highlight */}
        <div className="mt-6 bg-gradient-to-br from-dark-800 to-dark-700 border border-neon/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="coming-soon">Feature principale</Badge>
          </div>
          <h3 className="text-base font-bold text-white mb-2">Come funziona l'importazione PDF</h3>
          <ol className="space-y-2">
            {[
              'Scatta una foto della tua scheda o carica un PDF',
              'L\'AI analizza il documento e riconosce gli esercizi',
              'La scheda viene creata automaticamente nell\'app',
              'Personalizza e inizia ad allenarti!',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="w-5 h-5 rounded-full bg-neon/20 border border-neon/30 text-neon text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Nessun addebito ora · Cancella quando vuoi
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
