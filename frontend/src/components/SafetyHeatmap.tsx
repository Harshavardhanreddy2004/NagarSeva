import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Tooltip } from 'react-leaflet'
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
}

export default function SafetyHeatmap({
  heatmapData,
  center = [19.0760, 72.8777], // Mumbai default
  zoom = 12,
}: SafetyHeatmapProps) {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: '#dc2626', // red
      medium: '#f59e0b', // amber
      low: '#10b981', // green
    }
    return colors[severity] || colors.low
  }

  const getGridRadius = (count: number) => {
    if (count >= 10) return 30
    if (count >= 5) return 20
    if (count >= 3) return 15
    return 10
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render heatmap points */}
        {heatmapData.map((point) => {
          const color = getSeverityColor(point.severity)
          const radius = getGridRadius(point.complaint_count)

          return (
            <div
              key={point.grid_id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
            >
              {/* This would use react-leaflet's Circle component */}
              {/* For now, using simple SVG overlay approach */}
            </div>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10">
        <h3 className="font-semibold text-sm mb-3">Risk Level</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-xs">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-xs">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs">Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}
