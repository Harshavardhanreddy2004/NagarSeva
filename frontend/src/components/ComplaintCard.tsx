import React from 'react'

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
  image_path?: string
  images?: {
    image_path: string
  }[]
}

interface ComplaintCardProps {
  complaint: Complaint
  onClick?: (id: number) => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ComplaintCard({
  complaint,
  onClick,
}: ComplaintCardProps) {

  let imageUrl = ""

  if (complaint.image_path) {
    imageUrl = `${API_URL}/${complaint.image_path}`
  } else if (complaint.images?.length) {
    imageUrl = `${API_URL}/${complaint.images[0].image_path}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-orange-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div
      onClick={() => onClick?.(complaint.id)}
      className="bg-white rounded-[28px] shadow-[0_24px_80px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_28px_100px_rgba(15,23,42,0.12)] cursor-pointer overflow-hidden transition-transform duration-300"
    >
      <div className="flex flex-col md:flex-row">

        <div className="w-full md:w-48 h-48 bg-slate-100 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Complaint"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/400x300?text=No+Image"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              No Image Available
            </div>
          )}
        </div>

        <div className="flex-1 p-6 space-y-4">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            <div>
              <p className="text-slate-500 text-sm uppercase tracking-[0.2em] mb-2">
                Complaint #{complaint.id}
              </p>

              <h2 className="font-semibold text-2xl text-slate-900 leading-tight">
                {complaint.description}
              </h2>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.18em] ${getStatusColor(
                complaint.status
              )}`}
            >
              {complaint.status.replace('_', ' ')}
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500 mb-1">Priority</p>
              <p className={`font-semibold ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500 mb-1">Created</p>
              <p className="font-semibold text-slate-700">
                {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-slate-500 mb-1">Location</p>
              <p className="font-semibold text-slate-700">
                {complaint.location_address
                  ? complaint.location_address
                  : `Lat: ${complaint.location_lat.toFixed(4)}, Lon: ${complaint.location_lon.toFixed(4)}`}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}