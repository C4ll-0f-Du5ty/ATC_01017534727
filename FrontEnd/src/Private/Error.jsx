import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function ErrorRoute({ children }) {
    const { user } = useContext(AuthContext);
    const [redirect, setRedirect] = useState(false); // Control redirection

    useEffect(() => {
        if (user) {
            toast.error("You're authenticated!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Delay the redirect to give the toast time to show
            const timer = setTimeout(() => {
                setRedirect(true);
            }, 1000); // 1-second delay

            return () => clearTimeout(timer); // Cleanup timer on unmount
        }
    }, [user]);

    if (redirect) {
        // console.log(user)

        return <Navigate to={'/profile'} replace />;
    }

    return !user ? children || <Outlet /> : null; // Don't render anything until the delay is over
}

export default ErrorRoute;
