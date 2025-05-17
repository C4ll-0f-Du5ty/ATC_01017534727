import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
    const darkMode = localStorage.getItem('dark') === 'true'

    return (
        <div className={`min-h-screen flex items-center justify-center text-center p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
            >
                <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400">404</h1>
                <p className="mt-3 text-xl font-medium">
                    Page not found
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition"
                >
                    Go back home
                </Link>
            </motion.div>
        </div>
    )
}

export default NotFound
