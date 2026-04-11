import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/css/core.css'
import './index.css'
import App from './App.jsx'
import { PipelineProvider } from './context/PipelineContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PipelineProvider>
      <App />
    </PipelineProvider>
  </StrictMode>,
)
