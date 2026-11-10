import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { ResumeBuilder } from './components/ResumeBuilder'
import { hasStarted, markStarted } from './hooks/useResume'

export default function App() {
  const [started, setStarted] = useState(() => window.location.hash === '#editor')
  const [returning] = useState(hasStarted)

  const start = () => {
    markStarted()
    window.location.hash = 'editor'
    setStarted(true)
  }
  const home = () => {
    history.replaceState(null, '', window.location.pathname)
    setStarted(false)
  }

  return started ? <ResumeBuilder onHome={home} /> : <LandingPage onStart={start} hasData={returning} />
}
