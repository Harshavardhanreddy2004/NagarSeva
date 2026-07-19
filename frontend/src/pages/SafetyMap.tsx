import React, { useEffect, useState } from 'react'
import { complaintApi } from '../services/api'
import SafetyHeatmap from '../components/SafetyHeatmap'

interface HeatmapPoint {
  grid_id: string
  lat: number
  lon: number
  complaint_count: number
  severity: string
  issues: string[]
}

export default function SafetyMap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true)
      try {
        const response = await complaintApi.getHeatmapData()
        setHeatmapData(response.data.heatmap_data || [])
        setError(null)
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to fetch heatmap data'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [])

  // Calculate statistics for the display
  const highRiskZones = heatmapData.filter(p => p.severity === 'high').length
  const mediumRiskZones = heatmapData.filter(p => p.severity === 'medium').length
  const lowRiskZones = heatmapData.filter(p => p.severity === 'low').length
  const totalComplaints = heatmapData.reduce((sum, p) => sum + p.complaint_count, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Community Safety Map</h1>
          <p className="text-gray-600">
            Visual representation of civic issues and complaint density in your area
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading safety map...</p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-4">
                <p className="text-gray-600">
                  Red zones = High risk | Yellow zones = Medium risk | Green zones = Low risk
                </p>
              </div>
              {heatmapData.length > 0 ? (
                <SafetyHeatmap heatmapData={heatmapData} />
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500">No complaint data available</p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Complaints</h3>
                <p className="text-4xl font-bold text-blue-600">{totalComplaints}</p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">High Risk Zones</h3>
                <p className="text-4xl font-bold text-red-600">{highRiskZones}</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Medium Risk Zones</h3>
                <p className="text-4xl font-bold text-amber-600">{mediumRiskZones}</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Low Risk Zones</h3>
                <p className="text-4xl font-bold text-green-600">{lowRiskZones}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Zones</h3>
                <p className="text-4xl font-bold text-purple-600">{heatmapData.length}</p>
              </div>
            </div>

            {/* Detailed Zone List */}
            {heatmapData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Zone Details</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Zone ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Complaints
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Top Issues
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((zone) => {
                        const severityColor: Record<string, string> = {
                          high: 'bg-red-100 text-red-800',
                          medium: 'bg-amber-100 text-amber-800',
                          low: 'bg-green-100 text-green-800',
                        }

                        return (
                          <tr key={zone.grid_id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-900">{zone.grid_id}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {zone.lat.toFixed(4)}, {zone.lon.toFixed(4)}
                            </td>
                            <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                              {zone.complaint_count}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  severityColor[zone.severity] || severityColor.low
                                }`}
                              >
                                {zone.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              <div className="flex flex-wrap gap-1">
                                {zone.issues.slice(0, 3).map((issue) => (
                                  <span
                                    key={issue}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    {issue}
                                  </span>
                                ))}
                                {zone.issues.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{zone.issues.length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
