import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { toast } from 'react-toastify'
import { UploadCloud, Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const ProfileSettings = () => {
    const { authTokens, updateUsername } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        profile_picture: null,
    })
    const [previewImage, setPreviewImage] = useState(null)
    const [imageChanged, setImageChanged] = useState(false)
    const [removeImage, setRemoveImage] = useState(false)
    const [defaultImage] = useState('profile_pictures/default.png')
    const [loading, setLoading] = useState(false)
    const darkMode = JSON.parse(localStorage.getItem('dark')) || false

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true)
            try {
                const res = await fetch(api.profile, {
                    headers: { Authorization: `Dusty ${authTokens.access}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        username: data.username,
                        email: data.email,
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        profile_picture: null,
                    })
                    setPreviewImage(data.profile_picture || null)
                } else {
                    toast.error('Failed to fetch user profile', { position: 'top-center' })
                }
            } catch (err) {
                toast.error('Network error. Please try again.', { position: 'top-center' })
            } finally {
                setLoading(false)
            }
        }
        fetchUserProfile()
    }, [authTokens])

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'profile_picture') {
            const file = files[0]
            if (file) {
                if (!file.type.startsWith('image/')) {
                    toast.error('Please upload an image file', { position: 'top-center' })
                    return
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Image must be under 5MB', { position: 'top-center' })
                    return
                }
                setFormData((prev) => ({ ...prev, profile_picture: file }))
                setPreviewImage(URL.createObjectURL(file))
                setImageChanged(true)
                setRemoveImage(false)
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, profile_picture: null }))
        setPreviewImage(null)
        setImageChanged(true)
        setRemoveImage(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Invalid email format', { position: 'top-center' })
            return
        }
        if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters', { position: 'top-center' })
            return
        }
        setLoading(true)

        const data = new FormData()
        data.append('username', formData.username)
        data.append('email', formData.email)
        data.append('first_name', formData.first_name)
        data.append('last_name', formData.last_name)

        if (imageChanged) {
            if (formData.profile_picture) {
                data.append('profile_picture', formData.profile_picture)
            } else if (removeImage) {
                data.append('remove_profile_picture', 'true')
            }
        }

        try {
            const res = await fetch(api.profile, {
                method: 'PATCH',
                headers: {
                    Authorization: `Dusty ${authTokens.access}`,
                },
                body: data,
            })

            if (res.ok) {
                toast.success('Profile updated', { position: 'top-center' })
                updateUsername(formData.username)
                setTimeout(() => {
                    window.location.reload()
                }, 1000) // Delay to show toast
            } else {
                const err = await res.json()
                toast.error(err.detail || 'Failed to update profile', { position: 'top-center' })
            }
        } catch (err) {
            toast.error('Network error. Please try again.', { position: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
        >
            <div className="max-w-3xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Profile Settings
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                ) : (
                    <motion.form
                        onSubmit={handleSubmit}
                        className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Profile Picture Section */}
                        <div className="mb-8">
                            <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-4 flex-wrap">
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt="Profile Preview"
                                        className="w-20 h-20 rounded-full object-cover border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm"
                                    />
                                )}
                                <div
                                    className={`flex-1 p-4 border-2 border-dashed rounded-lg text-center ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const file = e.dataTransfer.files[0]
                                        if (file && file.type.startsWith('image/')) {
                                            setFormData((prev) => ({ ...prev, profile_picture: file }))
                                            setPreviewImage(URL.createObjectURL(file))
                                            setImageChanged(true)
                                            setRemoveImage(false)
                                        }
                                    }}
                                >
                                    <label className="cursor-pointer">
                                        <div className="flex flex-col items-center">
                                            <UploadCloud className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
                                            <span className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Drag & drop or click to upload
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            name="profile_picture"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {previewImage && !previewImage.includes(defaultImage) && (
                                    <motion.button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Trash2 size={16} />
                                        Remove
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                            {[
                                { label: 'Username', name: 'username', required: true, placeholder: 'Enter username' },
                                { label: 'First Name', name: 'first_name', placeholder: 'Enter first name' },
                                { label: 'Last Name', name: 'last_name', placeholder: 'Enter last name' },
                                {
                                    label: 'Email',
                                    name: 'email',
                                    type: 'email',
                                    required: true,
                                    placeholder: 'Enter email',
                                },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label
                                        className={`block mb-1 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                                    >
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        className={`w-full px-4 py-2 rounded-lg border shadow-sm transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </div>
        </motion.div>
    )
}

export default ProfileSettings
