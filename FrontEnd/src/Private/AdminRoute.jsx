import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function AdminRoute({ children }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [redirect, setRedirect] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("You're not authenticated!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                },
                progressStyle: {
                    backgroundColor: 'rgb(218 243 224)',
                }
            });

            const timer = setTimeout(() => {
                setRedirect(true);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (user.role !== 'admin') {
            toast.warning("Access denied: Admins only!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backgroundColor: '#ffa500',
                    color: '#000000',
                    fontSize: '16px',
                    fontWeight: 'bold',
                },
                progressStyle: {
                    backgroundColor: '#000000',
                }
            });

            const timer = setTimeout(() => {
                setUnauthorized(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [user]);

    if (redirect) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (unauthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    return user && user.role === 'admin' ? children || <Outlet /> : null;
}

export default AdminRoute;
