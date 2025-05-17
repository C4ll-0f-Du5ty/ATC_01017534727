import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api'
import { toast } from 'react-toastify'

const EventModal = ({ isOpen, onClose, fetchEvents, editData = null, token }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        date: '',
        venue: '',
        price: '',
        seats: '',
        status: 'upcoming',
        location_link: '',
        image: null,
    })
    const [previewImage, setPreviewImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const darkMode = JSON.parse(localStorage.getItem('dark')) || false

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(api.manageEvents, {
                    headers: { Authorization: `Dusty ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setCategories([...new Set(data.map((ev) => ev.category))])
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err)
            }
        }
        fetchCategories()
    }, [token])

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name,
                description: editData.description,
                category: editData.category,
                date: editData.date.slice(0, 16),
                venue: editData.venue,
                price: editData.price,
                seats: editData.seats || '',
                status: editData.status || 'upcoming',
                location_link: editData.location_link || '',
                image: null,
            })
            setPreviewImage(editData.image || null)
        } else {
            resetForm()
        }
    }, [editData])

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            date: '',
            venue: '',
            price: '',
            seats: '',
            status: 'upcoming',
            location_link: '',
            image: null,
        })
        setPreviewImage(null)
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'image' && files[0]) {
            const file = files[0]
            setFormData((prev) => ({ ...prev, image: file }))
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!formData.name || !formData.description || !formData.date || !formData.venue || !formData.price || !formData.seats || !formData.category) {
            toast.error('Please fill out all required fields')
            setLoading(false)
            return
        }

        if (new Date(formData.date) < new Date()) {
            toast.error('Event date must be in the future')
            setLoading(false)
            return
        }

        if (parseFloat(formData.price) < 0) {
            toast.error('Price must be non-negative')
            setLoading(false)
            return
        }

        if (parseInt(formData.seats, 10) < 0) {
            toast.error('Seats must be non-negative')
            setLoading(false)
            return
        }

        const data = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'image' && value) {
                data.append('image', value)
            } else if (key === 'location_link' && value) {
                data.append('location_link', value)
            } else if (value && key !== 'location_link') {
                if (key === 'date') {
                    data.append('date', new Date(value).toISOString())
                } else if (key === 'price') {
                    data.append('price', parseFloat(value))
                } else if (key === 'seats') {
                    data.append('seats', parseInt(value, 10))
                } else {
                    data.append(key, value)
                }
            }
        })

        const method = editData ? 'PUT' : 'POST'
        const endpoint = editData ? `${api.manageEvents}${editData.id}/` : api.manageEvents

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Dusty ${token}`,
                },
                body: data,
            })

            if (res.ok) {
                toast.success(`Event ${editData ? 'updated' : 'created'} successfully`)
                fetchEvents()
                resetForm()
                onClose()
            } else {
                const errorData = await res.json()
                const errorMessage = Object.entries(errorData)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('; ')
                toast.error(errorMessage || 'Failed to save event')
            }
        } catch (err) {
            toast.error('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: null }))
        setPreviewImage(null)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
                    }`}
            >
                <h2 className="text-2xl font-bold mb-4">{editData ? 'Edit Event' : 'Add Event'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Event Name
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Event Name"
                            required
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            required
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Category
                        </label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Category"
                            required
                            list="categories"
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                        <datalist id="categories">
                            {categories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date
                        </label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Venue
                        </label>
                        <input
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            placeholder="Venue"
                            required
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Available Seats
                        </label>
                        <input
                            type="number"
                            name="seats"
                            value={formData.seats}
                            onChange={handleChange}
                            placeholder="Available Seats"
                            required
                            min="0"
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Price"
                            required
                            min="0"
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Google Maps Link (optional)
                        </label>
                        <input
                            type="url"
                            name="location_link"
                            value={formData.location_link}
                            onChange={handleChange}
                            placeholder="Google Maps Link"
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                }`}
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Event preview"
                                className="max-w-xs max-h-40 object-contain rounded border dark:border-gray-700"
                            />
                        )}
                        <label
                            htmlFor="image-upload"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 text-sm"
                        >
                            {previewImage ? 'Change Image' : 'Upload Image'}
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />
                        {previewImage && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md"
                            >
                                Remove Image
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm()
                                onClose()
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-600 text-white px-4 py-2 rounded-md text-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : editData ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default EventModal
