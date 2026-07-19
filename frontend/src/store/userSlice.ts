import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  email: string
  name: string | null
  role: string
  created_at: string
}

interface UserState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setUser, logout, setLoading, setError } = userSlice.actions
export default userSlice.reducer
