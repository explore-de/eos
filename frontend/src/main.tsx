import CssBaseline from '@mui/material/CssBaseline'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'

import './i18n'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/mui-skin.css'
import { router } from '@/app/router'
import { oidcConfig } from '@/features/auth/oidcConfig'
import { store } from '@/app/store'
import { theme } from './theme'

const start = async () => {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

void start().then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <Provider store={store}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} defaultMode="dark">
              <CssBaseline />
              <RouterProvider router={router} />
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
      </AuthProvider>
    </StrictMode>,
  ),
)
