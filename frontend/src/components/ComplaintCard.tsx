import React from 'react'
import { useNavigate } from 'react-router-dom'

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
  images?: Array<{
    image_path: string
  }>
}

interface ComplaintCardProps {
  complaint: Complaint
  onClick?: (id: number) => void
}

export default function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  const navigate = useNavigate()
  const imageUrl = complaint.images?.[0]?.image_path

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || colors.submitted
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    }
    return colors[priority] || colors.medium
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  return (
    <div
      onClick={() => onClick?.(complaint.id)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {imageUrl && (
          <div className="sm:w-32 sm:h-32 h-48 bg-gray-200 flex-shrink-0">
            <img
              src={imageUrl}
              alt="Complaint"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-sm text-gray-500">Complaint #{complaint.id}</p>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {complaint.description}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                {complaint.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              📍 {complaint.location_address || `(${complaint.location_lat.toFixed(4)}, ${complaint.location_lon.toFixed(4)})`}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${getPriorityColor(complaint.priority)}`}>
                Priority: {complaint.priority}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(complaint.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
