import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function PrivateRoute({ children }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [redirect, setRedirect] = useState(false); // Control redirection

    useEffect(() => {
        if (!user) {
            toast.error("You're not authenticated!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                style: {
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                },
                progressStyle: {
                    backgroundColor: 'rgb(218 243 224)' // Orange color for the progress bar
                }
            });

            // Delay the redirect to give the toast time to show
            const timer = setTimeout(() => {
                setRedirect(true);
            }, 1000); // 1-second delay

            return () => clearTimeout(timer); // Cleanup timer on unmount
        }
    }, [user]);

    if (redirect) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return user ? children || <Outlet /> : null; // Don't render anything until the delay is over
}

export default PrivateRoute;
