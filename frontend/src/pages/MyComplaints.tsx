import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { setComplaints, setLoading, setFilters } from '../store/complaintSlice'
import { complaintApi } from '../services/api'
import ComplaintCard from '../components/ComplaintCard'

export default function MyComplaints() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.user)
  const { complaints, isLoading, filters } = useSelector((state: RootState) => state.complaints)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchComplaints = async () => {
      dispatch(setLoading(true))
      try {
        const response = await complaintApi.listComplaints({
          user_id: user.id,
          status: filters.status,
          priority: filters.priority,
        })
        dispatch(setComplaints(response.data.complaints || []))
        setError(null)
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to fetch complaints'
        setError(errorMessage)
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchComplaints()
  }, [user, filters, dispatch, navigate])

  const statusOptions = [
    { value: null, label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const priorityOptions = [
    { value: null, label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]

  const handleStatusChange = (status: string | null) => {
    dispatch(setFilters({ status }))
  }

  const handlePriorityChange = (priority: string | null) => {
    dispatch(setFilters({ priority }))
  }

  const handleComplaintClick = (id: number) => {
    // Could navigate to detail view if available
    console.log('Clicked complaint:', id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Complaints</h1>
          <p className="text-gray-600">
            Track all your civic issue reports and their status
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handlePriorityChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
              <button
                onClick={() => {
                  dispatch(setFilters({ status: null, priority: null }))
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Complaints List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">
              No complaints found matching your filters.
            </p>
            <button
              onClick={() => navigate('/report')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Report an Issue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={handleComplaintClick}
              />
            ))}
          </div>
        )}

        {/* Summary */}
        {complaints.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Complaints</p>
                <p className="text-2xl font-bold text-blue-600">{complaints.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {complaints.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {complaints.filter(c => c.status === 'submitted').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
