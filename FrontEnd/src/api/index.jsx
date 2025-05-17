// API endpoints
import { BASE_URL } from '../config'

const api = {
    login: `${BASE_URL}/users/login/`,
    refresh: `${BASE_URL}/users/refresh/`,
    register: `${BASE_URL}/users/register/`,
    profile: `${BASE_URL}/users/profile/`,
    events: `${BASE_URL}/events/all/`,
    manageEvents: `${BASE_URL}/events/manage/`,
    bookings: `${BASE_URL}/events/bookings/`,
    users: `${BASE_URL}/users/all/`,
}

export default api
