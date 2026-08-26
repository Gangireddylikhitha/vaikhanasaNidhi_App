import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initNativeShell } from './lib/native.js'
import { initAntiCopy } from './lib/antiCopy.js'

initNativeShell()
initAntiCopy()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
