import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import EventModal from '../components/EventModal'
import { Search, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const AdminPanel = () => {
    const { authTokens } = useContext(AuthContext)
    const navigate = useNavigate()
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('dark')) || false)
    const [events, setEvents] = useState([])
    const [users, setUsers] = useState([])
    const [bookings, setBookings] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [sortBy, setSortBy] = useState('date')
    const [modalOpen, setModalOpen] = useState(false)
    const [editEvent, setEditEvent] = useState(null)
    const [tab, setTab] = useState('events')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const html = document.documentElement
        html.classList.toggle('dark', darkMode)
        html.classList.toggle('light', !darkMode)
    }, [darkMode])

    const fetchEvents = async () => {
        try {
            const res = await fetch(api.manageEvents, {
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (!res.ok) throw new Error('Failed to fetch events')
            const data = await res.json()
            setEvents(data)
            applyFilters(data, searchTerm, categoryFilter, statusFilter, sortBy)
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await fetch(api.users, {
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const fetchBookings = async () => {
        try {
            const res = await fetch(api.bookings, {
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (!res.ok) throw new Error('Failed to fetch bookings')
            const data = await res.json()
            setBookings(data)
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    useEffect(() => {
        if (authTokens) {
            setLoading(true)
            Promise.all([fetchEvents(), fetchUsers(), fetchBookings()]).then(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [authTokens])

    const handleDeleteEvent = async (id, e) => {
        e.stopPropagation() // Prevent Link navigation
        if (!window.confirm('Are you sure you want to delete this event?')) return
        try {
            const res = await fetch(`${api.manageEvents}${id}/`, {
                method: 'DELETE',
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (res.status === 204) {
                toast.success('Event deleted', { position: 'top-center' })
                fetchEvents()
            } else {
                throw new Error('Failed to delete event')
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            const res = await fetch(`${api.users}${id}/`, {
                method: 'DELETE',
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (res.status === 204) {
                toast.success('User deleted', { position: 'top-center' })
                fetchUsers()
            } else {
                throw new Error('Failed to delete user')
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        try {
            const res = await fetch(`${api.bookings}${bookingId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (res.status === 204) {
                toast.success('Booking cancelled', { position: 'top-center' })
                fetchBookings()
            } else {
                throw new Error('Failed to cancel booking')
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const applyFilters = (data, term, category, status, sort) => {
        let filtered = [...data]
        if (term) {
            filtered = filtered.filter((ev) => ev.name.toLowerCase().includes(term.toLowerCase()))
        }
        if (category) {
            filtered = filtered.filter((ev) => ev.category.toLowerCase() === category.toLowerCase())
        }
        if (status) {
            filtered = filtered.filter((ev) => ev.status === status)
        }
        if (sort === 'date') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
        } else if (sort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name))
        }
        setFilteredEvents(filtered)
    }

    const handleSearch = (e) => {
        const term = e.target.value
        setSearchTerm(term)
        applyFilters(events, term, categoryFilter, statusFilter, sortBy)
    }

    const handleCategoryFilter = (e) => {
        const category = e.target.value
        setCategoryFilter(category)
        applyFilters(events, searchTerm, category, statusFilter, sortBy)
    }

    const handleStatusFilter = (e) => {
        const status = e.target.value
        setStatusFilter(status)
        applyFilters(events, searchTerm, categoryFilter, status, sortBy)
    }

    const handleSort = (e) => {
        const sort = e.target.value
        setSortBy(sort)
        applyFilters(events, searchTerm, categoryFilter, statusFilter, sort)
    }

    const handleEditEvent = (event, e) => {
        e.stopPropagation() // Prevent Link navigation
        setEditEvent(event)
        setModalOpen(true)
    }

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                }`}
        >
            <div className="flex justify-between items-center mb-6">
                <h1
                    className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'
                        }`}
                >
                    Admin Dashboard
                </h1>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                >
                    + Add Event
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                {['events', 'users', 'bookings'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${tab === t
                            ? 'bg-blue-600 text-white'
                            : darkMode
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'events' && (
                <>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex items-center gap-2 flex-1">
                            <Search
                                className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                            />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className={`w-full px-3 py-2 border rounded-md text-sm ${darkMode
                                    ? 'bg-gray-800 text-white border-gray-700'
                                    : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryFilter}
                            className={`px-3 py-2 border rounded-md text-sm ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        >
                            <option value="">All Categories</option>
                            {[...new Set(events.map((ev) => ev.category))].map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className={`px-3 py-2 border rounded-md text-sm ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        >
                            <option value="">All Statuses</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className={`px-3 py-2 border rounded-md text-sm ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        >
                            <option value="date">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>

                    {filteredEvents.length === 0 ? (
                        <p
                            className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        >
                            No events found.
                        </p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-lg shadow border transition-transform hover:scale-105 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Link
                                        to={`/event/${event.id}`}
                                        className="block"
                                        aria-label={`View details for ${event.name}`}
                                    >
                                        {event.image ? (
                                            <img
                                                src={event.image}
                                                alt={event.name}
                                                className="w-full h-40 object-cover rounded-md mb-3"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 rounded-md mb-3 flex items-center justify-center">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                        <h2
                                            className={`text-xl font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'
                                                }`}
                                        >
                                            {event.name}
                                        </h2>
                                        <p
                                            className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                }`}
                                        >
                                            {event.venue}
                                        </p>
                                        <p
                                            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                        >
                                            {new Date(event.date).toLocaleString()}
                                        </p>
                                        <p
                                            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                        >
                                            Status: {event.status}
                                        </p>
                                    </Link>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={(e) => handleEditEvent(event, e)}
                                            className="bg-yellow-500 text-white py-1 px-3 rounded-md text-sm hover:bg-yellow-600"
                                            aria-label={`Edit event ${event.name}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteEvent(event.id, e)}
                                            className="bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700"
                                            aria-label={`Delete event ${event.name}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'users' && (
                <div className="space-y-4">
                    {users.length === 0 ? (
                        <p
                            className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        >
                            No users found.
                        </p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                className={`p-4 rounded-lg shadow flex justify-between items-center ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
                                    }`}
                            >
                                <div>
                                    <Link
                                        to={`/user/${user.id}`}
                                        className={`font-semibold hover:underline ${darkMode ? 'text-white' : 'text-gray-900'
                                            }`}
                                    >
                                        {user.username}
                                    </Link>
                                    <p
                                        className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}
                                    >
                                        {user.email}
                                    </p>
                                    <p
                                        className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}
                                    >
                                        Role: {user.role}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/user/${user.id}/edit`)}
                                        disabled={user.role === 'admin'}
                                        className={`px-4 py-1 rounded-md text-sm text-white ${user.role === 'admin'
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {user.role === 'admin' ? 'Admin' : 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={user.role === 'admin'}
                                        className={`px-4 py-1 rounded-md text-sm text-white ${user.role === 'admin'
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'bookings' && (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <p
                            className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        >
                            No bookings found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className={`min-w-full table-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'
                                    }`}
                            >
                                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    <tr>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            User
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            Event
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            Booked On
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className={`border-t ${darkMode
                                                ? 'border-gray-700 hover:bg-gray-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'
                                                    }`}
                                            >
                                                {booking.user?.username || 'Unknown User'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'
                                                    }`}
                                            >
                                                {booking.event_details?.name || 'Unknown Event'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}
                                            >
                                                {booking.booked_at
                                                    ? new Date(booking.booked_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className={`text-red-500 hover:text-red-700 text-sm font-medium ${booking.event_details?.date &&
                                                        new Date(booking.event_details.date) < new Date()
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                        }`}
                                                    disabled={
                                                        booking.event_details?.date &&
                                                        new Date(booking.event_details.date) < new Date()
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <EventModal
                isOpen={modalOpen}
                onClose={() => {
                    setEditEvent(null)
                    setModalOpen(false)
                }}
                fetchEvents={fetchEvents}
                editData={editEvent}
                token={authTokens?.access}
            />
        </div>
    )
}

export default AdminPanel
