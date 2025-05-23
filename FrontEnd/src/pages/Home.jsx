import React, { useEffect, useState, useContext } from 'react'
import api from '../api'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Home = () => {
    const [events, setEvents] = useState([])
    const [bookedEvents, setBookedEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [darkMode, setDarkMode] = useState(localStorage.getItem('dark') === 'true')
    const { authTokens } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('dark') === 'true')
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(api.events)
                if (!res.ok) throw new Error('Failed to fetch events')
                const data = await res.json()
                setEvents(data)
            } catch (err) {
                toast.error(err.message, { position: 'top-center' })
            }
        }

        const fetchBookedEvents = async () => {
            if (!authTokens) return
            try {
                const res = await fetch(api.bookings, {
                    headers: { Authorization: `Dusty ${authTokens.access}` },
                })
                if (!res.ok) throw new Error('Failed to fetch bookings')
                const data = await res.json()
                setBookedEvents(data.map((booking) => booking.event_details.id))
            } catch (err) {
                toast.error(err.message, { position: 'top-center' })
            }
        }

        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchEvents(), fetchBookedEvents()])
            setLoading(false)
        }

        loadData()
    }, [authTokens])

    const handleBooking = async (eventId) => {
        if (!authTokens) {
            toast.warning('Please log in to book events', { position: 'top-center' })
            return navigate('/login')
        }

        try {
            const res = await fetch(api.bookings, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Dusty ${authTokens.access}`,
                },
                body: JSON.stringify({ event: eventId }),
            })

            if (res.status === 201) {
                toast.success('Event booked successfully', { position: 'top-center' })
                setBookedEvents([...bookedEvents, eventId])
            } else if (res.status === 400) {
                toast.info("You've already booked this event", { position: 'top-center' })
            } else {
                throw new Error('Something went wrong. Try again.')
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

    return (
        <div
            className={`min-h-screen w-full px-6 py-10 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
                }`}
        >
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    className="text-4xl font-extrabold mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Upcoming Events
                </motion.h1>

                {events.length === 0 ? (
                    <p className="text-center text-lg text-gray-500 dark:text-gray-400">
                        No events found.
                    </p>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event, i) => (
                            <motion.article
                                key={event.id}
                                className={`flex flex-col rounded-2xl shadow-lg overflow-hidden border transition-colors duration-300 flex-grow ${darkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                    : 'bg-white border-gray-200 hover:border-blue-600'
                                    }`}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link to={`/event/${event.id}`}>
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.name}
                                            className="h-52 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-52 w-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                No Image
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col p-6">
                                        <h2 className="text-2xl font-semibold mb-2">
                                            {event.name}
                                        </h2>
                                        <p className="text-sm mb-4 min-h-[80px]">
                                            {event.description?.slice(0, 100) ??
                                                'No description available'}
                                            ...
                                        </p>
                                        <ul className="text-sm space-y-1 mb-6">
                                            <li>
                                                <strong>Venue:</strong> {event.venue}
                                            </li>
                                            <li>
                                                <strong>Date:</strong>{' '}
                                                {new Date(event.date).toLocaleString()}
                                            </li>
                                            <li>
                                                <strong>Price:</strong>{' '}
                                                {typeof Number(event.price) === 'number'
                                                    ? `$${event.price}`
                                                    : 'Free'}
                                            </li>
                                        </ul>
                                    </div>
                                </Link>

                                {bookedEvents.includes(event.id) ? (
                                    <div
                                        className={`mx-6 mb-6 py-3 text-center rounded-md font-semibold ${darkMode
                                            ? 'bg-green-600 text-white'
                                            : 'bg-green-700 text-white'
                                            }`}
                                    >
                                        Booked
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        className={`mt-auto rounded-md py-3 font-semibold transition-colors duration-300 mx-6 mb-6 ${darkMode
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                            : 'bg-blue-700 hover:bg-blue-800 text-white'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            handleBooking(event.id)
                                        }}
                                    >
                                        Book Now
                                    </motion.button>
                                )}
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home
