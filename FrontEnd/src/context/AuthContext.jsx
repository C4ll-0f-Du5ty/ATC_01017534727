import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import api from '../api'
import { ExpandIcon } from 'lucide-react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const temp = localStorage.getItem("authTokens")
    const [authTokens, setAuthTokens] = useState(() => temp ? JSON.parse(temp) : null)
    const [user, setUser] = useState(() => temp ? jwtDecode(temp) : null)
    const [loading, setLoading] = useState(true)

    const loginUser = async (e) => {
        e.preventDefault()
        console.log("Welcome")

        const response = await fetch(api.login, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({
                username: e.target.username.value,
                password: e.target.password.value,
            })
        })

        const data = await response.json()
        if (response.status === 200) {
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            localStorage.setItem("authTokens", JSON.stringify(data))
            setLoading(true)
            return true
        } else {
            toast.error("Wrong Credentials", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            return false
        }
    }

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem("authTokens")
        setLoading(false)
    }

    const updateToken = async () => {
        console.log("updated!!")
        try {
            if (user) {
                const response = await fetch(api.refresh, {
                    method: "POST",
                    headers: { 'Content-Type': "application/json" },
                    body: JSON.stringify({ refresh: authTokens?.refresh })
                })

                const data = await response.json()
                if (response.status === 200) {
                    setAuthTokens(data)
                    setUser(jwtDecode(data.access))
                    localStorage.setItem("authTokens", JSON.stringify(data))
                } else {
                    logoutUser()
                }
            }
        } catch (e) {
            console.error('Error: ', e.message)
        }
        if (loading) {
            setLoading(false)
        }
    }

    const updateUsername = (newUsername) => {
        setUser(prev => {
            const updated = prev ? { ...prev, username: newUsername } : prev
            console.log("Updated User:", updated)
            return updated
        })
    }

    useEffect(() => {
        if (loading) {
            updateToken()
        }
        const interval = setInterval(() => {
            if (authTokens) updateToken()
        }, 1000 * 60 * 4)

        return () => clearInterval(interval)
    }, [authTokens, loading])

    const contextData = {
        user,
        updateUsername,
        authTokens,
        loginUser,
        logoutUser,
        updateToken
    }

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}
