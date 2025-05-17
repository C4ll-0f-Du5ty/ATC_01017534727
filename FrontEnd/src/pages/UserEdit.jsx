import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { toast } from 'react-toastify'

const UserEdit = () => {
    const { id } = useParams()
    const { authTokens } = useContext(AuthContext)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'user',
        profile_picture: null,
    })
    const [previewImage, setPreviewImage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})
    const darkMode = JSON.parse(localStorage.getItem('dark')) || false

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${api.users}${id}/`, {
                    headers: { Authorization: `Dusty ${authTokens.access}` },
                })
                if (!res.ok) throw new Error('Failed to load user data')
                const data = await res.json()
                setFormData({
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    role: data.role,
                    profile_picture: null,
                })
                setPreviewImage(data.profile_picture || null)
            } catch (err) {
                toast.error(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [id, authTokens])

    const validateForm = () => {
        const newErrors = {}
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username must be alphanumeric with underscores'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'profile_picture') {
            const file = files[0]
            setFormData((prev) => ({ ...prev, profile_picture: file }))
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return
        setSaving(true)

        const data = new FormData()
        data.append('username', formData.username)
        data.append('email', formData.email)
        data.append('first_name', formData.first_name)
        data.append('last_name', formData.last_name)
        data.append('role', formData.role)
        if (formData.profile_picture) {
            data.append('profile_picture', formData.profile_picture)
        }

        try {
            const res = await fetch(`${api.users}${id}/`, {
                method: 'PATCH',
                headers: { Authorization: `Dusty ${authTokens.access}` },
                body: data,
            })

            if (res.ok) {
                toast.success('User updated successfully')
                navigate('/admin')
            } else {
                const err = await res.json()
                const errorMessage = Object.entries(err)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('; ')
                toast.error(errorMessage || 'Update failed')
            }
        } catch (err) {
            toast.error('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
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

    return (
        <div
            className={`max-w-3xl mx-auto p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
        >
            <h2 className="text-2xl font-bold mb-6">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {['username', 'email', 'first_name', 'last_name'].map((field) => (
                    <div key={field}>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        <input
                            type={field === 'email' ? 'email' : 'text'}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required={field === 'username' || field === 'email'}
                            className={`w-full px-3 py-2 rounded-md border transition focus:ring-2 ${darkMode
                                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
                                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
                                } ${errors[field] ? 'border-red-500' : ''}`}
                        />
                        {errors[field] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                        )}
                    </div>
                ))}
                <div>
                    <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-md border transition ${darkMode
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                            }`}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border dark:border-gray-600"
                        />
                    )}
                    <label className="inline-block">
                        <span className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Change Profile Picture
                        </span>
                        <input
                            type="file"
                            name="profile_picture"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                            id="profile-upload"
                        />
                        <label
                            htmlFor="profile-upload"
                            className="inline-block cursor-pointer px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                            Choose File
                        </label>
                    </label>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white text-sm"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UserEdit
