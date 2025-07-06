import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import App from './App.jsx'
import './index.css'
import { StagewiseToolbar } from '@stagewise/toolbar-react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
)

// Mount Stagewise toolbar only during development to avoid bundling it for production
if (import.meta.env.DEV) {
  const toolbarRootId = 'stagewise-toolbar-root'
  let toolbarRoot = document.getElementById(toolbarRootId)

  // Create a dedicated DOM node for the toolbar if it doesn't exist yet
  if (!toolbarRoot) {
    toolbarRoot = document.createElement('div')
    toolbarRoot.id = toolbarRootId
    document.body.appendChild(toolbarRoot)
  }

  ReactDOM.createRoot(toolbarRoot).render(
    <React.StrictMode>
      <StagewiseToolbar config={{ plugins: [] }} />
    </React.StrictMode>,
  )
} 