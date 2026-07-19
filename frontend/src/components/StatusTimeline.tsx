import React from 'react'

interface StatusTimelineProps {
  status: string
  history?: Array<{
    id: number
    old_status: string | null
    new_status: string
    change_reason: string | null
    timestamp: string
  }>
}

export default function StatusTimeline({ status, history = [] }: StatusTimelineProps) {
  const statusFlow = [
    { key: 'submitted', label: 'Submitted', icon: '📝' },
    { key: 'assigned', label: 'Assigned', icon: '✋' },
    { key: 'in_progress', label: 'In Progress', icon: '⚙️' },
    { key: 'resolved', label: 'Resolved', icon: '✓' },
  ]

  const statusIndex = statusFlow.findIndex(s => s.key === status)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {statusFlow.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                  index <= statusIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.icon}
              </div>
              <p className={`text-xs mt-2 font-semibold ${
                index <= statusIndex ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </p>
            </div>
            {index < statusFlow.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < statusIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* History */}
      {history && history.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Timeline</h4>
          {history.map((event) => (
            <div key={event.id} className="text-sm text-gray-600">
              <p className="font-semibold">
                {event.new_status.replace('_', ' ').toUpperCase()}
              </p>
              {event.change_reason && (
                <p className="text-gray-500">{event.change_reason}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(event.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
