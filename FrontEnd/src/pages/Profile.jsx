import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

const ITEMS_PER_PAGE = 5

const Profile = () => {
    const { authTokens, user } = useContext(AuthContext)
    const [bookings, setBookings] = useState([])
    const [profile, setProfile] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const darkMode = localStorage.getItem('dark') === 'true'

    useEffect(() => {
        if (!authTokens) {
            setLoading(false)
            return
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
                setError(err.message)
                toast.error('Error fetching bookings', { position: 'top-center' })
            }
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch(api.profile, {
                    headers: { Authorization: `Dusty ${authTokens.access}` },
                })
                if (!res.ok) throw new Error('Failed to fetch profile')
                const data = await res.json()
                setProfile(data)
            } catch (err) {
                setError(err.message)
                toast.error('Error fetching profile', { position: 'top-center' })
            }
        }

        const fetchData = async () => {
            setLoading(true)
            await Promise.all([fetchBookings(), fetchProfile()])
            setLoading(false)
        }

        fetchData()
    }, [authTokens])

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        try {
            const res = await fetch(`${api.bookings}${bookingId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (!res.ok) throw new Error('Failed to cancel booking')
            setBookings(bookings.filter((booking) => booking.id !== bookingId))
            toast.success('Booking cancelled successfully', { position: 'top-center' })
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
        }
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentBookings = bookings.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <p className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Error: {error}</p>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-6 mb-8 p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <img
                        src={profile?.profile_picture || '/profile_pictures/default.png'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border dark:border-gray-700"
                        onError={(e) => (e.target.src = '/profile_pictures/default.png')}
                    />
                    <div className="flex-1">
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Welcome, {profile?.first_name || user?.username || 'User'}
                        </h2>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {profile?.email || 'No email provided'}
                        </p>
                    </div>
                    <a
                        href="settings/"
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        Edit Profile
                    </a>
                </motion.div>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Your Bookings
                    </h3>

                    {bookings.length === 0 ? (
                        <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            You have no bookings yet.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table
                                    className={`min-w-full table-auto border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                        <tr>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Event
                                            </th>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Venue
                                            </th>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Status
                                            </th>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Booked On
                                            </th>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Event Date
                                            </th>
                                            <th
                                                className={`px-4 py-2 text-left ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBookings.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className={`border-t ${darkMode
                                                    ? 'border-gray-700 hover:bg-gray-700'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td
                                                    className={`px-4 py-2 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'
                                                        }`}
                                                >
                                                    {booking.event_details?.name || 'Unknown Event'}
                                                </td>
                                                <td
                                                    className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}
                                                >
                                                    {booking.event_details?.venue || 'N/A'}
                                                </td>
                                                <td
                                                    className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}
                                                >
                                                    {booking.event_details?.status || 'N/A'}
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
                                                    {booking.event_details?.date
                                                        ? new Date(booking.event_details.date).toLocaleString()
                                                        : 'N/A'}
                                                </td>
                                                <td
                                                    className={`px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => cancelBooking(booking.id)}
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

                            <div className="flex justify-center mt-6 space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${currentPage === 1
                                        ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${currentPage === totalPages
                                        ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </motion.section>
            </div>
        </div>
    )
}

export default Profile
