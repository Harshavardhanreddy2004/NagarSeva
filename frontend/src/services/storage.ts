/**
 * Local storage helpers for persisting form data
 */

const STORAGE_PREFIX = 'nagarseva_'

export const storage = {
  // Save complaint form data
  saveComplaintDraft: (data: {
    description?: string
    issueType?: string
    latitude?: number
    longitude?: number
    imagePreview?: string
  }) => {
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}complaint_draft`,
        JSON.stringify(data)
      )
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  },

  // Load complaint form data
  loadComplaintDraft: () => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}complaint_draft`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  },

  // Clear complaint form data
  clearComplaintDraft: () => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}complaint_draft`)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  },

  // Save user preferences
  saveUserPreference: (key: string, value: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}pref_${key}`, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to save preference ${key}:`, error)
    }
  },

  // Load user preference
  loadUserPreference: (key: string) => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}pref_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Failed to load preference ${key}:`, error)
      return null
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear all:', error)
    }
  },
}
