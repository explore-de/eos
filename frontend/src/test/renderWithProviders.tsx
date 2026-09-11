import { ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'

import { createStore } from '../app/store'
import type { AppStore } from '../app/store'
import i18n from '../i18n'
import { theme } from '../theme'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  store?: AppStore
  route?: string
  path?: string
  language?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { store = createStore(), route = '/', path = '*', language = 'en', ...options }: Options = {},
) {
  void i18n.changeLanguage(language)

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={[route]}>
              <Routes>
                <Route path={path} element={children} />
              </Routes>
            </MemoryRouter>
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) }
}
