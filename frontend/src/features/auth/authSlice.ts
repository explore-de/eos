import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import {
  clearVisitSession,
  readVisitSession,
  writeVisitSession,
} from '@/features/visitor/visitSessionCookie'
import type { VisitSession } from '@/features/visitor/visitSessionCookie'

export interface AuthState {
  accessToken: string | null
  visit: VisitSession | null
}

const initialState: AuthState = {
  accessToken: null,
  visit: readVisitSession(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    accessTokenReceived(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
    },
    signedOut(state) {
      state.accessToken = null
    },
    visitSessionStarted(state, action: PayloadAction<VisitSession>) {
      state.visit = action.payload
      writeVisitSession(action.payload)
    },
    visitSessionEnded(state) {
      state.visit = null
      clearVisitSession()
    },
  },
})

export const { accessTokenReceived, signedOut, visitSessionStarted, visitSessionEnded } =
  authSlice.actions
export const authReducer = authSlice.reducer
