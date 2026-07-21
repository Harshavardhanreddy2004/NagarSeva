import React from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface HeatmapPoint {
  grid_id: string
  lat: number
  lon: number
  complaint_count: number
  severity: string
  issues: string[]
}

interface SafetyHeatmapProps {
  heatmapData: HeatmapPoint[]
  center?: [number, number]
  zoom?: number
  userLocation?: [number, number]
}

function CenterControl({ center }: { center: [number, number] }) {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

export default function SafetyHeatmap({
  heatmapData,
  center = [19.0760, 72.8777], // Mumbai default
  zoom = 12,
  userLocation,
}: SafetyHeatmapProps) {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: '#dc2626',
      medium: '#f59e0b',
      low: '#10b981',
    }
    return colors[severity] || colors.low
  }

  const getGridRadius = (count: number) => {
    if (count >= 10) return 240
    if (count >= 5) return 170
    if (count >= 3) return 120
    return 80
  }

  const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: '<div class="bg-sky-600/90 border border-white rounded-full w-5 h-5 shadow-lg animate-pulse"></div>',
  })

  return (
    <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/30 ring-1 ring-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <CenterControl center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {heatmapData.map((point) => {
          const color = getSeverityColor(point.severity)
          const radius = getGridRadius(point.complaint_count)

          return (
            <Circle
              key={point.grid_id}
              center={[point.lat, point.lon]}
              pathOptions={{
                color,
                fillColor: `${color}88`,
                fillOpacity: 0.22,
                weight: 2,
              }}
              radius={radius}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-sm font-semibold text-slate-900">
                  {point.complaint_count} complaints
                  <div className="text-xs text-slate-700">{point.severity.toUpperCase()}</div>
                </div>
              </Tooltip>
            </Circle>
          )
        })}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Your current location</p>
                <p>Map centered here</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white/95 p-4 rounded-2xl shadow-xl border border-slate-200 backdrop-blur z-20">
        <h3 className="font-semibold text-sm mb-3 text-slate-700">Risk Legend</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-red-600"></span>
            <span>High risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
            <span>Medium risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
            <span>Low risk</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
              <span className="inline-flex h-3 w-3 rounded-full bg-sky-600 shadow-lg shadow-sky-600/30 animate-pulse"></span>
              <span className="text-slate-700">My location</span>
            </div>
          )}
        </div>
      </div>
      {userLocation && (
        <div className="absolute top-4 right-4 bg-slate-950/90 text-slate-100 px-4 py-3 rounded-3xl shadow-2xl shadow-slate-950/30 backdrop-blur z-20">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">You are here</p>
          <p className="mt-1 text-sm font-semibold">Current location highlighted on the map</p>
        </div>
      )}
    </div>
  )
}
