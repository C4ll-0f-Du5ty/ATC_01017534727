import React, { useContext } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import { AuthContext } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import Register from './pages/Register'
import 'react-toastify/dist/ReactToastify.css'
import Error from './Private/Error'
import PrivateRoute from './Private/privateRoute'
import Home from './pages/Home'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'
import ProfileSettings from './pages/ProfileSettings'
import UserProfile from './pages/UserProfile'
import UserEdit from './pages/UserEdit'
import EventDetails from './pages/EventDetails'

const App = () => {

  const { user } = useContext(AuthContext)
  return (
    <BrowserRouter>
      <>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Home */}
            <Route path="/" element={<Home />} />

            {/* Login/Register Barriers */}
            <Route element={<Error />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<ProfileSettings />} />

              {user && user?.role === 'admin' && <>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/user/:id/edit" element={<UserEdit />} />
              </>
              }
            </Route>
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="*" element={<NotFound />} />
            {/* other routes here */}
          </Routes>
        </div>
        <ToastContainer />
      </>
    </BrowserRouter>
  )
}

export default App
