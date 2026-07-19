import React, { useState, useEffect } from 'react'
import { getGeolocation } from '../services/geolocation'

interface LocationPickerProps {
  onLocationSelected: (lat: number, lon: number) => void
  disabled?: boolean
}

export default function LocationPicker({ onLocationSelected, disabled = false }: LocationPickerProps) {
  const [lat, setLat] = useState<string>('')
  const [lon, setLon] = useState<string>('')
  const [useGPS, setUseGPS] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string>('')

  useEffect(() => {
    if (lat && lon) {
      onLocationSelected(parseFloat(lat), parseFloat(lon))
    }
  }, [lat, lon])

  const handleGetGPS = async () => {
    setGpsLoading(true)
    setError(null)
    try {
      const location = await getGeolocation()
      setLat(location.latitude.toString())
      setLon(location.longitude.toString())
      setUseGPS(true)
      // Reverse geocode to get location name (simple approximation)
      setLocationName(`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`)
    } catch (err) {
      setError('Could not access your location. Please enter manually.')
      console.error(err)
      // Fallback to Mumbai
      setLat('19.0760')
      setLon('72.8777')
      setLocationName('Mumbai, Maharashtra (default)')
    } finally {
      setGpsLoading(false)
    }
  }

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLat(e.target.value)
    setUseGPS(false)
    validateCoordinates(e.target.value, lon)
  }

  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLon(e.target.value)
    setUseGPS(false)
    validateCoordinates(lat, e.target.value)
  }

  const validateCoordinates = (latitude: string, longitude: string) => {
    if (!latitude || !longitude) {
      setError(null)
      return
    }

    const latNum = parseFloat(latitude)
    const lonNum = parseFloat(longitude)

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('Please enter valid numbers')
      return
    }

    if (latNum < -90 || latNum > 90) {
      setError('Latitude must be between -90 and 90')
      return
    }

    if (lonNum < -180 || lonNum > 180) {
      setError('Longitude must be between -180 and 180')
      return
    }

    setError(null)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-3 items-center mb-4">
        <button
          onClick={handleGetGPS}
          disabled={disabled || gpsLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          type="button"
        >
          {gpsLoading ? '⏳' : '📍'} {gpsLoading ? 'Getting location...' : 'Get My Location'}
        </button>
        {useGPS && (
          <span className="text-green-600 text-sm font-semibold">✓ GPS active</span>
        )}
      </div>

      {locationName && (
        <p className="text-gray-600 text-sm bg-blue-50 p-2 rounded">
          {locationName}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            value={lat}
            onChange={handleLatChange}
            disabled={disabled}
            placeholder="-90 to 90"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            value={lon}
            onChange={handleLonChange}
            disabled={disabled}
            placeholder="-180 to 180"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {lat && lon && !error && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
          <p className="text-green-700 text-sm">
            ✓ Location set to ({parseFloat(lat).toFixed(4)}, {parseFloat(lon).toFixed(4)})
          </p>
        </div>
      )}
    </div>
  )
}
