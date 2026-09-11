import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const VISIT_TOKEN_KEY = 'eos.visitToken'

export interface AuthState {
  accessToken: string | null
  visitToken: string | null
}

const initialState: AuthState = {
  accessToken: null,
  visitToken: localStorage.getItem(VISIT_TOKEN_KEY),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    accessTokenReceived(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
    },
    visitTokenReceived(state, action: PayloadAction<string>) {
      state.visitToken = action.payload
      localStorage.setItem(VISIT_TOKEN_KEY, action.payload)
    },
    signedOut(state) {
      state.accessToken = null
    },
    visitTokenCleared(state) {
      state.visitToken = null
      localStorage.removeItem(VISIT_TOKEN_KEY)
    },
  },
})

export const { accessTokenReceived, signedOut, visitTokenReceived, visitTokenCleared } =
  authSlice.actions
export const authReducer = authSlice.reducer
