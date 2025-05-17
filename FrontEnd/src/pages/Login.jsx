import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'

const Login = () => {
    const { loginUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [formData, setFormData] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const darkMode = localStorage.getItem('dark') === 'true'

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        const success = await loginUser(e)
        setLoading(false)
        if (success) {
            toast.success('Welcome back! Redirecting to profile...')
            navigate('/profile')
        }
    }

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}
        >
            <form
                onSubmit={handleSubmit}
                className={`shadow-lg rounded-xl p-8 w-full max-w-sm transition ${darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
            >
                <h2
                    className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'
                        }`}
                >
                    Sign In to Your Account
                </h2>

                <div className="mb-4">
                    <label
                        htmlFor="username"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        required
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    />
                </div>

                <div className="mb-6 relative">
                    <label
                        htmlFor="password"
                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                    >
                        Password
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className={`absolute top-9 right-3 ${darkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-md font-semibold transition-colors duration-300 ${loading
                            ? 'bg-blue-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    )
}

export default Login
