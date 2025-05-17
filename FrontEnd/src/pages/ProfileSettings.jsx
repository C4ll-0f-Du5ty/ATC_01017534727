import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api'
import { toast } from 'react-toastify'
import { UploadCloud, Trash2 } from 'lucide-react'

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

    const darkMode = localStorage.getItem('dark') === 'true'

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true)
            const res = await fetch(api.profile, {
                headers: { Authorization: `Dusty ${authTokens.access}` },
            })
            if (res.ok) {
                const data = await res.json()
                setFormData(prev => ({
                    ...prev,
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                }))
                setPreviewImage(data.profile_picture || null)
            } else {
                toast.error('Failed to fetch user profile')
            }
            setLoading(false)
        }
        fetchUserProfile()
    }, [authTokens])

    const handleChange = e => {
        const { name, value, files } = e.target
        if (name === 'profile_picture') {
            const file = files[0]
            setFormData(prev => ({ ...prev, profile_picture: file }))
            setPreviewImage(URL.createObjectURL(file))
            setImageChanged(true)
            setRemoveImage(false)
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, profile_picture: null }))
        setPreviewImage(null)
        setImageChanged(true)
        setRemoveImage(true)
    }

    const handleSubmit = async e => {
        e.preventDefault()
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

        const res = await fetch(api.profile, {
            method: 'PATCH',
            headers: {
                Authorization: `Dusty ${authTokens.access}`,
            },
            body: data,
        })

        setLoading(false)

        if (res.ok) {
            toast.success('Profile updated')
            updateUsername(formData.username)
        } else {
            toast.error('Failed to update profile')
        }
    }

    return (
        <div className={`max-w-3xl mx-auto p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Profile Settings
            </h2>

            {loading ? (
                <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse">
                    Saving or Loading Profile...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border dark:border-gray-700"
                            />
                        )}

                        {/* Custom File Upload */}
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer text-sm transition">
                            <UploadCloud className="mr-2" size={18} />
                            Upload New Image
                            <input
                                type="file"
                                name="profile_picture"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </label>

                        {previewImage && !previewImage.includes(defaultImage) && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded transition"
                            >
                                <Trash2 size={16} />
                                Remove Image
                            </button>
                        )}
                    </div>

                    {[
                        { label: 'Username', name: 'username' },
                        { label: 'First Name', name: 'first_name' },
                        { label: 'Last Name', name: 'last_name' },
                        { label: 'Email', name: 'email', type: 'email' }
                    ].map(field => (
                        <div key={field.name}>
                            <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {field.label}
                            </label>
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.name === 'username' || field.name === 'email'}
                                className={`w-full px-3 py-2 rounded border transition duration-200 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                        Save Changes
                    </button>
                </form>
            )}
        </div>
    )
}

export default ProfileSettings
