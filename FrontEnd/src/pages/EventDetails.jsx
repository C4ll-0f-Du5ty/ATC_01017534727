import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { toast } from 'react-toastify'
import EventModal from '../components/EventModal'

const EventDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { authTokens, user } = useContext(AuthContext)
    const [event, setEvent] = useState(null)
    const [bookings, setBookings] = useState([])
    const [users, setUsers] = useState({})
    const [userLoading, setUserLoading] = useState({})
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const darkMode = JSON.parse(localStorage.getItem('dark')) || false

    const fetchUser = async (userId) => {
        if (users[userId] || userLoading[userId]) return
        setUserLoading((prev) => ({ ...prev, [userId]: true }))
        try {
            const res = await fetch(`${api.users}${userId}/`, {
                headers: authTokens ? { Authorization: `Dusty ${authTokens.access}` } : {},
            })
            if (!res.ok) {
                console.error(`Failed to fetch user ${userId}: ${res.status}`)
                throw new Error('Failed to fetch user')
            }
            const data = await res.json()
            setUsers((prev) => ({ ...prev, [userId]: data }))
        } catch (err) {
            // Suppress toast for 403 errors
            if (err.message !== 'Failed to fetch user') {
                toast.error(err.message, { position: 'top-center' })
            }
        } finally {
            setUserLoading((prev) => ({ ...prev, [userId]: false }))
        }
    }

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${api.events}${id}/`, {
                    headers: authTokens ? { Authorization: `Dusty ${authTokens.access}` } : {},
                })
                if (!res.ok) throw new Error('Event not found')
                const data = await res.json()
                setEvent(data)
                // Only fetch user if created_by is a number (ID)
                if (data.created_by && typeof data.created_by === 'number') {
                    await fetchUser(data.created_by)
                }
            } catch (err) {
                toast.error(err.message, { position: 'top-center' })
            }
        }

        const fetchBookings = async () => {
            if (user?.role === 'admin' && authTokens) {
                try {
                    const res = await fetch(api.bookings, {
                        headers: { Authorization: `Dusty ${authTokens.access}` },
                    })
                    if (!res.ok) throw new Error('Failed to fetch bookings')
                    const data = await res.json()
                    const eventBookings = data.filter((b) => b.event_details.id === parseInt(id))
                    setBookings(eventBookings)
                    for (const booking of eventBookings) {
                        if (booking.user?.id && !users[booking.user.id] && typeof booking.user.id === 'number') {
                            await fetchUser(booking.user.id)
                        }
                    }
                } catch (err) {
                    toast.error(err.message, { position: 'top-center' })
                }
            }
        }

        setLoading(true)
        Promise.all([fetchEvent(), fetchBookings()]).then(() => setLoading(false))
    }, [id, authTokens, user, users])

    const handleBookEvent = async () => {
        if (!authTokens) {
            toast.error("Sign in to book this event! Don't have an account? Sign up now.", {
                position: 'top-center',
                autoClose: 3000,
                onClose: () => navigate('/login'),
            })
            return
        }
        setBookingLoading(true)
        try {
            const res = await fetch(api.bookings, {
                method: 'POST',
                headers: {
                    Authorization: `Dusty ${authTokens.access}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event: id }),
            })
            if (res.ok) {
                toast.success('Event booked successfully', { position: 'top-center' })
            } else {
                const err = await res.json()
                toast.error(err.detail || 'Failed to book event', { position: 'top-center' })
            }
        } catch (err) {
            toast.error('Network error. Please try again.', { position: 'top-center' })
        } finally {
            setBookingLoading(false)
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
                setBookings(bookings.filter((b) => b.id !== bookingId))
            } else {
                throw new Error('Failed to cancel booking')
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const handleEditEvent = () => {
        setModalOpen(true)
    }

    const handleFetchEvents = async () => {
        try {
            const res = await fetch(`${api.events}${id}/`, {
                headers: authTokens ? { Authorization: `Dusty ${authTokens.access}` } : {},
            })
            if (!res.ok) throw new Error('Event not found')
            const data = await res.json()
            setEvent(data)
            if (data.created_by && typeof data.created_by === 'number' && !users[data.created_by]) {
                await fetchUser(data.created_by)
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!event) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-500'}`}
            >
                Event not found.
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{event.name}</h1>
                    <button
                        onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Back to {user?.role === 'admin' ? 'Admin' : 'Events'}
                    </button>
                </div>
                <div
                    className={`rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                >
                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-64 object-cover rounded-md mb-6"
                        />
                    ) : (
                        <div
                            className={`w-full h-64 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-md mb-6 flex items-center justify-center`}
                        >
                            <span className="text-gray-500 dark:text-gray-400">No Image</span>
                        </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                        <p>
                            <span className="font-semibold">Description:</span> {event.description}
                        </p>
                        <p>
                            <span className="font-semibold">Category:</span> {event.category}
                        </p>
                        <p>
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(event.date).toLocaleString()}
                        </p>
                        <p>
                            <span className="font-semibold">Venue:</span> {event.venue}
                        </p>
                        <p>
                            <span className="font-semibold">Price:</span> ${event.price}
                        </p>
                        <p>
                            <span className="font-semibold">Seats:</span> {event.seats}
                        </p>
                        <p>
                            <span className="font-semibold">Status:</span> {event.status}
                        </p>
                        {event.location_link && (
                            <p>
                                <span className="font-semibold">Location:</span>{' '}
                                <a
                                    href={event.location_link}
                                    className="text-blue-500 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Map
                                </a>
                            </p>
                        )}
                        {user && <p>
                            <span className="font-semibold">Created By:</span>{' '}
                            {typeof event.created_by === 'string'
                                ? event.created_by
                                : userLoading[event.created_by]
                                    ? 'Loading...'
                                    : users[event.created_by]?.username || event.created_by || 'Unknown'}
                        </p>}
                        <p>
                            <span className="font-semibold">Published At:</span>{' '}
                            {new Date(event.published_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-6">
                        {user?.role !== 'admin' && event.status === 'upcoming' && event.seats > 0 && (
                            <button
                                onClick={handleBookEvent}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${bookingLoading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? 'Booking...' : 'Book Now'}
                            </button>
                        )}
                        {user?.role === 'admin' && (
                            <button
                                onClick={handleEditEvent}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm font-medium"
                            >
                                Edit Event
                            </button>
                        )}
                    </div>
                </div>

                {user?.role === 'admin' && bookings.length > 0 && (
                    <div
                        className={`mt-8 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
                    >
                        <h2 className="text-xl font-semibold mb-4">Bookings</h2>
                        <div className="overflow-x-auto">
                            <table
                                className={`min-w-full table-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    <tr>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                        >
                                            User
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                        >
                                            Booked On
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
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
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                                            >
                                                {typeof booking.user?.username === 'string'
                                                    ? booking.user.username
                                                    : userLoading[booking.user?.id]
                                                        ? 'Loading...'
                                                        : users[booking.user?.id]?.username ||
                                                        booking.user?.id ||
                                                        'Unknown User'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                            >
                                                {booking.booked_at
                                                    ? new Date(booking.booked_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
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
                    </div>
                )}
            </div>

            {user?.role === 'admin' && modalOpen && (
                <EventModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    fetchEvents={handleFetchEvents}
                    editData={event}
                    token={authTokens?.access}
                />
            )}
        </div>
    )
}

export default EventDetails
