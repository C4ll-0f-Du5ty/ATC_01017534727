import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { toast } from 'react-toastify'

const UserProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { authTokens, user: currentUser } = useContext(AuthContext)
    const [user, setUser] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const darkMode = JSON.parse(localStorage.getItem('dark')) || false

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${api.users}${id}/`, {
                    headers: { Authorization: `Dusty ${authTokens.access}` },
                })
                if (!res.ok) throw new Error('Failed to load user data')
                const data = await res.json()
                setUser(data)
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
                setBookings(data.filter((b) => b.user.id === parseInt(id)))
            } catch (err) {
                toast.error(err.message, { position: 'top-center' })
            }
        }

        setLoading(true)
        Promise.all([fetchUser(), fetchBookings()]).then(() => setLoading(false))
    }, [id, authTokens])

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

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName[0] : ''
        const last = lastName ? lastName[0] : ''
        return `${first}${last}`.toUpperCase()
    }

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                    }`}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-600'
                    }`}
            >
                User not found
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                }`}
        >
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">User Profile</h1>
                    <button
                        onClick={() =>
                            navigate(currentUser?.role === 'admin' ? '/admin' : '/events')
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Back to {currentUser?.role === 'admin' ? 'Admin' : 'Events'}
                    </button>
                </div>
                <div
                    className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                        {user.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={`${user.username}'s avatar`}
                                className="w-24 h-24 rounded-full object-cover border ${
                                    darkMode ? 'border-gray-600' : 'border-gray-300'
                                }"
                            />
                        ) : (
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-xl font-semibold ${darkMode
                                        ? 'bg-gray-600 text-gray-200'
                                        : 'bg-gray-300 text-gray-600'
                                    }`}
                            >
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl font-bold">{user.username}</h2>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>{user.email}</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                {user.first_name} {user.last_name}
                            </p>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Role: {user.role}</p>
                        </div>
                    </div>
                    <Link
                        to={`/user/${id}/edit`}
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                    >
                        Edit User
                    </Link>
                </div>

                {bookings.length > 0 && (
                    <div
                        className={`mt-8 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'
                            } p-6`}
                    >
                        <h2 className="text-xl font-semibold mb-4">Bookings</h2>
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
                                            Event
                                        </th>
                                        <th
                                            className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            Booked On
                                        </th>
                                        {(currentUser?.role === 'admin' ||
                                            currentUser?.id === parseInt(id)) && (
                                                <th
                                                    className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'
                                                        }`}
                                                >
                                                    Action
                                                </th>
                                            )}
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
                                                {booking.event_details?.name || 'Unknown Event'}
                                            </td>
                                            <td
                                                className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}
                                            >
                                                {booking.booked_at
                                                    ? new Date(
                                                        booking.booked_at
                                                    ).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            {(currentUser?.role === 'admin' ||
                                                currentUser?.id === parseInt(id)) && (
                                                    <td
                                                        className={`px-4 py-2 ${darkMode
                                                                ? 'text-gray-300'
                                                                : 'text-gray-600'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleCancelBooking(booking.id)
                                                            }
                                                            className={`text-red-500 hover:text-red-700 text-sm font-medium ${booking.event_details?.date &&
                                                                    new Date(
                                                                        booking.event_details.date
                                                                    ) < new Date()
                                                                    ? 'opacity-50 cursor-not-allowed'
                                                                    : ''
                                                                }`}
                                                            disabled={
                                                                booking.event_details?.date &&
                                                                new Date(
                                                                    booking.event_details.date
                                                                ) < new Date()
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserProfile
