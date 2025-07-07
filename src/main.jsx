import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@material-tailwind/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Mount Stagewise toolbar only during development to avoid bundling it for production
if (import.meta.env.DEV) {
  try {
    const { StagewiseToolbar } = await import('@stagewise/toolbar-react')
    const { ReactPlugin } = await import('@stagewise-plugins/react')
    
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
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      </React.StrictMode>,
    )
  } catch (err) {
    console.log('Stagewise toolbar not available in dev mode')
  }
} 