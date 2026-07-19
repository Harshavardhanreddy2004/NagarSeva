import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isLoading: boolean
  showModal: boolean
  modalContent: string | null
  notification: {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null
}

const initialState: UIState = {
  isLoading: false,
  showModal: false,
  modalContent: null,
  notification: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.showModal = true
      state.modalContent = action.payload
    },
    closeModal: (state) => {
      state.showModal = false
      state.modalContent = null
    },
    showNotification: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>
    ) => {
      state.notification = action.payload
    },
    hideNotification: (state) => {
      state.notification = null
    },
  },
})

export const {
  setLoading,
  openModal,
  closeModal,
  showNotification,
  hideNotification,
} = uiSlice.actions
export default uiSlice.reducer
