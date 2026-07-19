import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import complaintReducer from './complaintSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    complaints: complaintReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
