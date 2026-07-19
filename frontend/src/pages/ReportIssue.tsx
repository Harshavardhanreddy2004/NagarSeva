import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import { addComplaint, setLoading, setError as setComplaintError } from '../store/complaintSlice'
import { complaintApi } from '../services/api'
import ImageUpload from '../components/ImageUpload'
import LocationPicker from '../components/LocationPicker'

export default function ReportIssue() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.user)
  const { isLoading } = useSelector((state: RootState) => state.complaints)

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [issueType, setIssueType] = useState('pothole')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to report an issue.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const issueTypes = [
    { value: 'pothole', label: '🕳️ Pothole / Road Damage' },
    { value: 'street_light', label: '💡 Street Light Not Working' },
    { value: 'garbage', label: '🗑️ Garbage / Waste Dumping' },
    { value: 'drain', label: '🌧️ Drain / Waterlogging' },
    { value: 'encroachment', label: '🚧 Encroachment / Obstruction' },
    { value: 'sidewalk', label: '🛣️ Damaged Sidewalk' },
    { value: 'safety', label: '🌙 Dark / Unsafe Area' },
    { value: 'other', label: '📝 Other' },
  ]

  const handleImageSelected = (file: File, preview: string) => {
    setImage(file)
    setImagePreview(preview)
  }

  const handleLocationSelected = (lat: number, lon: number) => {
    setLatitude(lat)
    setLongitude(lon)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!description.trim()) {
      setError('Please provide a description')
      return
    }

    if (latitude === null || longitude === null) {
      setError('Please select a location')
      return
    }

    if (!image) {
      setError('Please upload an image')
      return
    }

    dispatch(setLoading(true))

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('location_lat', latitude.toString())
      formData.append('location_lon', longitude.toString())
      formData.append('description', description)
      formData.append('issue_type', issueType)

      const response = await complaintApi.createComplaint(formData)
      
      dispatch(addComplaint(response.data))
      setSubmitted(true)

      // Reset form
      setImage(null)
      setImagePreview(null)
      setDescription('')
      setLatitude(null)
      setLongitude(null)

      // Redirect to my complaints after 2 seconds
      setTimeout(() => {
        navigate('/my-complaints')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit complaint'
      setError(errorMessage)
      dispatch(setComplaintError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Complaint Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting this issue. We will process it shortly.
          </p>
          <p className="text-gray-500 text-sm">Redirecting to your complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Report a Civic Issue</h1>
          <p className="text-gray-600 mb-8">
            Help improve your neighborhood by reporting problems like potholes, broken street lights, garbage, and more.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📸 Upload Image
              </label>
              <ImageUpload
                onImageSelected={handleImageSelected}
                disabled={isLoading}
              />
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                placeholder="Describe the issue in detail... (What is the problem? How urgent is it? Any other details?)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-32"
              />
              <p className="text-gray-500 text-sm mt-2">
                {description.length}/500 characters
              </p>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📍 Location
              </label>
              <LocationPicker
                onLocationSelected={handleLocationSelected}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading || !image || !description.trim() || latitude === null || longitude === null}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Submitting...' : '✓ Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
