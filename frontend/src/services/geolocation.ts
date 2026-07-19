export const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        // Fallback to default location (Mumbai)
        console.warn('Geolocation error:', error)
        resolve({
          latitude: 19.0760,
          longitude: 72.8777,
        })
      }
    )
  })
}

export const getMockLocation = () => ({
  latitude: 19.0760,
  longitude: 72.8777,
})
