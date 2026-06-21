import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


const LOGIN_URL ="https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async () => {
        setError('');
        try {
            const res = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        console.log("Status:", res.status);
        console.log("Message:", data.message);
        console.log("Full Data:", data);

        if (res.ok && data?.data?.token) {
            Cookies.set('jwt_token', data.data.token);
            navigate('/');
        } else {
            setError(data?.message || 'Invalid email or password');
        }
        } catch (err) {
            setError('Network error. Please try again later.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Login to Go Business</h1>
                <p> sign in to open your referral dashboard.</p>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

               
                <button className="signin-btn" onClick={handleSignIn}>
                    Sign In
                </button>
            </div>
        </div>
    );
}

export default LoginPage;