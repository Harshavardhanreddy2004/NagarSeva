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
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [locationStatus, setLocationStatus] = useState('Detecting your location...')
  const [locationError, setLocationError] = useState<string | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by your browser.')
      setLocationError('Please use a browser with location support.')
      const fallback: [number, number] = [19.0760, 72.8777]
      setCurrentLocation(fallback)
      setMapCenter(fallback)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos: [number, number] = [position.coords.latitude, position.coords.longitude]
        setCurrentLocation(userPos)
        setMapCenter(userPos)
        setLocationStatus('Map centered on your current location')
        setLocationError(null)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied.')
          setLocationError('Allow location access and try again.')
        } else {
          setLocationStatus('Unable to detect your location. Showing the default city view.')
          setLocationError('Location detection failed. Try again.')
        }
        const fallback: [number, number] = [19.0760, 72.8777]
        setCurrentLocation(fallback)
        setMapCenter(fallback)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    )
  }

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

    requestLocation()
    fetchHeatmapData()
  }, [])

  // Calculate statistics for the display
  const highRiskZones = heatmapData.filter(p => p.severity === 'high').length
  const mediumRiskZones = heatmapData.filter(p => p.severity === 'medium').length
  const lowRiskZones = heatmapData.filter(p => p.severity === 'low').length
  const totalComplaints = heatmapData.reduce((sum, p) => sum + p.complaint_count, 0)

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl shadow-slate-300/20 text-white ring-1 ring-white/10">
            <h1 className="text-5xl font-extrabold tracking-tight">Community Safety Map</h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Discover local civic risk zones, centered on your current location with live heatmap overlays and modern UI controls.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100 ring-1 ring-white/10 backdrop-blur">
                📍 {locationStatus}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sm text-sky-100 ring-1 ring-sky-200/20">
                {currentLocation ? `Lat: ${currentLocation[0].toFixed(4)}, Lon: ${currentLocation[1].toFixed(4)}` : 'Location pending...'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-3xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg">Loading safety map...</p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-6 mb-8 transition-transform duration-500 hover:-translate-y-1">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Your Neighborhood Safety View</h2>
                  <p className="text-sm text-slate-500">
                    The map now focuses on your GPS location instead of a global view.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentLocation) {
                          setMapCenter(currentLocation)
                          setLocationStatus('Recentered to your current location')
                        }
                      }}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700"
                    >
                      Recenter to me
                    </button>
                    {locationError && (
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-amber-400"
                      >
                        Retry location
                      </button>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 shadow-sm">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Real-time risk overview
                  </span>
                </div>
              </div>
              {heatmapData.length > 0 ? (
                <SafetyHeatmap
                  heatmapData={heatmapData}
                  center={mapCenter ?? [19.0760, 72.8777]}
                  userLocation={currentLocation ?? undefined}
                  zoom={13}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-slate-100 rounded-3xl">
                  <p className="text-slate-500">No complaint data available yet.</p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="rounded-3xl bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Total Complaints</p>
                <p className="mt-4 text-4xl font-extrabold text-sky-600">{totalComplaints}</p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 p-6 shadow-lg transition duration-300 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">High Risk Zones</p>
                <p className="mt-4 text-4xl font-extrabold text-rose-600">{highRiskZones}</p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg transition duration-300 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Medium Risk Zones</p>
                <p className="mt-4 text-4xl font-extrabold text-amber-600">{mediumRiskZones}</p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-lg transition duration-300 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Low Risk Zones</p>
                <p className="mt-4 text-4xl font-extrabold text-emerald-600">{lowRiskZones}</p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Total Zones</p>
                <p className="mt-4 text-4xl font-extrabold text-violet-600">{heatmapData.length}</p>
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
