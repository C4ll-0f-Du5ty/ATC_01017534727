import React, { useContext, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Moon, Sun, ChevronDown, Settings, User, Shield, Loader, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const Navbar = () => {
    const { user, logoutUser, authTokens } = useContext(AuthContext)
    const navigate = useNavigate()
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('dark')
        return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
    })
    const [loading, setLoading] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef()
    const [userData, setUserData] = useState(null)

    useEffect(() => {
        const html = document.documentElement
        if (darkMode) {
            html.classList.add('dark')
            html.classList.remove('light')
        } else {
            html.classList.remove('dark')
            html.classList.add('light')
        }
        localStorage.setItem('dark', JSON.stringify(darkMode))
    }, [darkMode])

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (authTokens && !userData) {
                try {
                    const res = await fetch(api.profile, {
                        headers: { Authorization: `Dusty ${authTokens.access}` },
                    })
                    if (res.ok) {
                        const data = await res.json()
                        setUserData(data)
                    } else {
                        console.error('Failed to fetch profile:', res.status)
                    }
                } catch (err) {
                    console.error('Error fetching profile:', err)
                }
            }
        }
        fetchProfile()
    }, [authTokens, userData])

    const handleLogout = () => {
        logoutUser()
        setDropdownOpen(false)
        navigate('/')
    }

    const toggleThemeWithRefresh = () => {
        setLoading(true)
        const newTheme = !darkMode
        setDarkMode(newTheme)
        localStorage.setItem('dark', JSON.stringify(newTheme))
        setTimeout(() => {
            window.location.reload()
        }, 400)
    }

    return (
        <nav className={`shadow px-6 py-3 flex justify-between items-center transition duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <Link
                to="/"
                className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 select-none"
                aria-label="EventSphere Home"
            >
                Eventory
            </Link>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleThemeWithRefresh}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className={`p-2 rounded transition ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'}`}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {loading && (
                    <Loader className="animate-spin text-blue-600 dark:text-blue-300" size={20} />
                )}

                {user && userData ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className={`flex items-center gap-2 font-semibold px-3 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-200'}`}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <img
                                src={userData.profile_picture || '/default.jpg'}
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover border dark:border-gray-600"
                            />
                            <ChevronDown size={16} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className={`absolute right-0 mt-2 w-48 shadow-lg rounded-md py-2 text-sm z-50 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
                                    role="menu"
                                >
                                    <li className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={userData.profile_picture || '/default.jpg'}
                                                alt="user avatar"
                                                className="w-10 h-10 rounded-full object-cover border dark:border-gray-600"
                                            />
                                            <div>
                                                <p className="font-semibold">{userData.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</p>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <Link
                                            to="/"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-600"
                                            role="menuitem"
                                        >
                                            <Home size={16} /> Home
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-600"
                                            role="menuitem"
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to="/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-600"
                                            role="menuitem"
                                        >
                                            <Settings size={16} /> Settings
                                        </Link>
                                    </li>

                                    {user.role === 'admin' && (
                                        <li>
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-600"
                                                role="menuitem"
                                            >
                                                <Shield size={16} /> Admin Panel
                                            </Link>
                                        </li>
                                    )}

                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-400"
                                            role="menuitem"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 rounded transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 rounded transition"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar
