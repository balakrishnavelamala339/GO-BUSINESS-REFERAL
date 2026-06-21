import React from 'react';
import{ Link,useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        navigate('/login');
    };

    return (
        <div className="navbar">
            <Link to="/" className="navbar-brand" aria-label="Go to dashboard homepage">
                Go Business
            </Link>
            <nav aria-label="Primary">
                <Link to="/">Home</Link>
            </nav>
            <button className="logout-btn" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Navbar;