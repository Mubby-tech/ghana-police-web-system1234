// API Configuration for Ghana Police DTS
// This centralizes the backend URL for easy deployment changes

const API_BASE_URL = import.meta.env.VITE_API_URL || '${`${config.API_BASE_URL}';

export const config = {
  API_BASE_URL: API_BASE_URL,
  API_ENDPOINTS: {
    AUTH: `${API_BASE_URL}/api/auth`,
    INMATES: `${API_BASE_URL}/api/inmates`,
    CASES: `${API_BASE_URL}/api/cases`,
    CRIME_REPORTS: `${API_BASE_URL}/api/crime-reports`,
    EDMS: `${API_BASE_URL}/api/edms`,
    PERSONNEL: `${API_BASE_URL}/api/personnel`,
    SETTINGS: `${API_BASE_URL}/api/settings`,
    DASHBOARD: `${API_BASE_URL}/api/dashboard`,
    NOTIFICATIONS: `${API_BASE_URL}/api/notifications`
  }
};