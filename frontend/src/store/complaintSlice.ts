import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Complaint {
  id: number
  user_id: number
  description: string
  status: string
  priority: string
  location_lat: number
  location_lon: number
  location_address: string | null
  created_at: string
  images: any[]
  history: any[]
}

interface ComplaintState {
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  isLoading: boolean
  error: string | null
  filters: {
    status: string | null
    priority: string | null
  }
}

const initialState: ComplaintState = {
  complaints: [],
  selectedComplaint: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
  },
}

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.complaints = action.payload
    },
    addComplaint: (state, action: PayloadAction<Complaint>) => {
      state.complaints.unshift(action.payload)
    },
    setSelectedComplaint: (state, action: PayloadAction<Complaint | null>) => {
      state.selectedComplaint = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setFilters: (state, action: PayloadAction<{ status?: string | null; priority?: string | null }>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    updateComplaintStatus: (state, action: PayloadAction<{ id: number; status: string }>) => {
      const complaint = state.complaints.find(c => c.id === action.payload.id)
      if (complaint) {
        complaint.status = action.payload.status
      }
    },
  },
})

export const {
  setComplaints,
  addComplaint,
  setSelectedComplaint,
  setLoading,
  setError,
  setFilters,
  updateComplaintStatus,
} = complaintSlice.actions
export default complaintSlice.reducer
