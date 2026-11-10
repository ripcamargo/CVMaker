import { ArrowRight, FileCheck2, LayoutTemplate, ShieldCheck, Zap } from 'lucide-react'
import { Header } from './Header'

export function LandingPage({ onStart, hasData }: { onStart: () => void; hasData: boolean }) {
  return (
    <div className="landing">
      <Header />
      <main className="hero">
        <div className="hero-text">
          <span className="eyebrow">Construtor de currículos</span>
          <h1>
            Um currículo profissional,
            <br />
            pronto em minutos.
          </h1>
          <p>
            Preencha suas informações, escolha entre três modelos e acompanhe o resultado em tempo real. Exporte em
            PDF com qualidade A4 — tudo direto no seu navegador, sem cadastro.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
              {hasData ? 'Continuar meu currículo' : 'Criar meu currículo'} <ArrowRight size={18} />
            </button>
            <span className="muted small">Gratuito · Sem login · Seus dados ficam só no seu dispositivo</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mock mock-3">
            <MockEuro />
          </div>
          <div className="mock mock-2">
            <MockModern />
          </div>
          <div className="mock mock-1">
            <MockElegant />
          </div>
        </div>
      </main>

      <section className="features">
        <Feature icon={<LayoutTemplate size={20} />} title="Três modelos reais">
          Elegante, Moderno e Europeu: layouts de fato diferentes, não só cores.
        </Feature>
        <Feature icon={<Zap size={20} />} title="Preview em tempo real">
          Veja cada página A4 exatamente como será exportada, com quebras de página inteligentes.
        </Feature>
        <Feature icon={<FileCheck2 size={20} />} title="Pensado para recrutadores">
          Sem barras de nível ou gráficos arbitrários. Estrutura limpa e legível por sistemas ATS.
        </Feature>
        <Feature icon={<ShieldCheck size={20} />} title="Privado por padrão">
          Sem servidor e sem conta. Tudo é salvo localmente no seu navegador.
        </Feature>
      </section>

      <footer className="landing-footer">CVMaker · Feito para funcionar 100% no seu navegador</footer>
    </div>
  )
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="feature">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  )
}

const bar = (w: number, c = '#cfd4dc', h = 3) => <i style={{ width: `${w}%`, height: h, background: c }} />

function MockElegant() {
  return (
    <div className="mock-doc">
      <div style={{ textAlign: 'center', paddingBottom: 10, borderBottom: '1px solid #111' }}>
        <i style={{ width: '56%', height: 9, background: '#111', margin: '0 auto 6px' }} />
        <i style={{ width: '34%', height: 3, background: '#999', margin: '0 auto' }} />
      </div>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ marginTop: 14 }}>
          {bar(24, '#111', 3)}
          <div style={{ height: 6 }} />
          {bar(96)}
          {bar(90)}
          {bar(72)}
        </div>
      ))}
    </div>
  )
}
function MockModern() {
  return (
    <div className="mock-doc" style={{ display: 'grid', gridTemplateColumns: '32% 1fr', padding: 0 }}>
      <div style={{ background: '#1e3a5f', padding: 12 }}>
        <i style={{ width: 34, height: 34, borderRadius: 99, background: '#fff', opacity: 0.85, margin: '0 auto 14px' }} />
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ marginBottom: 12 }}>
            {bar(70, '#fff', 3)}
            <div style={{ height: 5 }} />
            {bar(90, 'rgba(255,255,255,.45)')}
            {bar(60, 'rgba(255,255,255,.45)')}
          </div>
        ))}
      </div>
      <div style={{ padding: 14 }}>
        {bar(70, '#1e3a5f', 9)}
        <div style={{ height: 5 }} />
        {bar(44, '#999')}
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ marginTop: 14 }}>
            {bar(30, '#1e3a5f', 3)}
            <div style={{ height: 6 }} />
            {bar(96)}
            {bar(86)}
            {bar(70)}
          </div>
        ))}
      </div>
    </div>
  )
}
function MockEuro() {
  return (
    <div className="mock-doc">
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1b4b91', paddingBottom: 10 }}>
        <div style={{ width: '60%' }}>
          {bar(70, '#1b4b91', 9)}
          <div style={{ height: 5 }} />
          {bar(46, '#999')}
        </div>
        <i style={{ width: 30, height: 36, background: '#cbd5e1' }} />
      </div>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ marginTop: 14 }}>
          {bar(30, '#1b4b91', 3)}
          <div style={{ height: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '26% 1fr', gap: 8 }}>
            <div>{bar(80, '#999')}</div>
            <div>
              {bar(96)}
              {bar(80)}
              {bar(88)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
