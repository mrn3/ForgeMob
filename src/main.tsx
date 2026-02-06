import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import App from './App'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider theme={defaultTheme} colorScheme="light" locale="en-US">
      <App />
    </Provider>
  </StrictMode>,
)
