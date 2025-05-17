import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'

const Register = () => {
    const navigate = useNavigate()
    const darkMode = localStorage.getItem('dark') === 'true'

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    })

    const [touched, setTouched] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }))
    }

    const validatePassword = (password) => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    })

    const passwordValid = validatePassword(formData.password)
    const allPasswordValid = Object.values(passwordValid).every(Boolean)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.password2) {
            toast.error("Passwords do not match")
            return
        }

        const response = await fetch(api.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })

        if (response.status === 201) {
            toast.success("Account created successfully")
            navigate('/login')
        } else {
            const data = await response.json()
            if (data.username) toast.error(`Username: ${data.username[0]}`)
            if (data.email) toast.error(`Email: ${data.email[0]}`)
            if (data.password) toast.error(`Password: ${data.password[0]}`)
            if (data.non_field_errors) toast.error(data.non_field_errors[0])
        }
    }

    const inputStyle = (field, valid) =>
        `w-full px-3 py-2 rounded-md mb-4 border transition focus:outline-none focus:ring-2 ${touched[field]
            ? valid
                ? 'border-green-500 focus:ring-green-400'
                : 'border-red-500 focus:ring-red-400'
            : `${darkMode ? 'border-gray-600 focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'}`
        } ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 transition ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <form
                onSubmit={handleSubmit}
                className={`shadow-md rounded-lg p-8 w-full max-w-md transition ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Register
                </h2>

                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Username
                </label>
                <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputStyle('username', formData.username.length >= 2)}
                />

                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputStyle('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                />

                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputStyle('password', allPasswordValid)}
                />

                <ul className="text-sm mb-4 space-y-1">
                    <li className={passwordValid.length ? 'text-green-500' : 'text-red-500'}>✓ At least 8 characters</li>
                    <li className={passwordValid.upper ? 'text-green-500' : 'text-red-500'}>✓ One uppercase letter</li>
                    <li className={passwordValid.lower ? 'text-green-500' : 'text-red-500'}>✓ One lowercase letter</li>
                    <li className={passwordValid.number ? 'text-green-500' : 'text-red-500'}>✓ One number</li>
                </ul>

                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirm Password
                </label>
                <input
                    type="password"
                    name="password2"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputStyle('password2', formData.password === formData.password2 && formData.password2.length > 0)}
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                >
                    Create Account
                </button>
            </form>
        </div>
    )
}

export default Register
