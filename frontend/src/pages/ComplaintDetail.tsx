import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complaintApi } from '../services/api'

interface ComplaintDetails {
  id: number
  user_id: number
  description: string
  status: string
  priority: string
  location_lat: number
  location_lon: number
  location_address: string | null
  created_at: string
  assigned_at: string | null
  resolved_at: string | null
  images: {
    image_path: string
  }[]
  history: {
    id: number
    old_status: string | null
    new_status: string
    change_reason: string | null
    timestamp: string
  }[]
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    const fetchComplaint = async () => {
      try {
        const response = await complaintApi.getComplaint(Number(id))
        setComplaint(response.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load complaint')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaint()
  }, [id])

  const handleResolve = async () => {
    if (!complaint) return
    setIsUpdating(true)
    try {
      const response = await complaintApi.updateStatus(complaint.id, 'resolved')
      setComplaint(response.data)
      window.dispatchEvent(
        new CustomEvent('complaint-status-changed', {
          detail: { id: complaint.id, status: 'resolved' },
        }),
      )
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resolve complaint')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading complaint...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-complaints')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to My Complaints
          </button>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Complaint #{complaint.id}</h1>
              <p className="text-gray-600">{complaint.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/my-complaints')}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              {complaint.status !== 'resolved' && (
                <button
                  onClick={handleResolve}
                  disabled={isUpdating}
                  className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Status</h2>
                <p className="text-gray-700 capitalize">{complaint.status}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Priority</h2>
                <p className="text-gray-700 capitalize">{complaint.priority}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <p className="text-gray-700">
                  {complaint.location_address
                    ? complaint.location_address
                    : `Lat: ${complaint.location_lat.toFixed(4)}, Lon: ${complaint.location_lon.toFixed(4)}`}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Timestamps</h2>
                <p className="text-gray-700">Created: {new Date(complaint.created_at).toLocaleString()}</p>
                {complaint.assigned_at && (
                  <p className="text-gray-700">Assigned: {new Date(complaint.assigned_at).toLocaleString()}</p>
                )}
                {complaint.resolved_at && (
                  <p className="text-gray-700">Resolved: {new Date(complaint.resolved_at).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {complaint.images.length > 0 ? (
                <div className="grid gap-4">
                  {complaint.images.map((image, index) => (
                    <img
                      key={index}
                      src={`${API_URL}/${image.image_path}`}
                      alt={`Complaint ${complaint.id}`}
                      className="w-full h-80 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Image+not+available'
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  No images available for this complaint.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">History</h2>
            {complaint.history.length === 0 ? (
              <p className="text-gray-600">No status updates yet.</p>
            ) : (
              <div className="space-y-3">
                {complaint.history.map((entry) => (
                  <div key={entry.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="text-gray-700 font-semibold">{entry.new_status}</p>
                    <p className="text-gray-600 text-sm">{entry.change_reason || 'No reason provided'}</p>
                    <p className="text-gray-500 text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
