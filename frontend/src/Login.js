// src/Login.js
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });
        
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                setMessage('Welcome back! You are now signed in.');
                setMessageType('success');
                setTimeout(() => setMessage(''), 3000);
            }
        });
        
        return () => listener?.subscription?.unsubscribe?.();
    }, []);

    async function signIn(e) {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        const { error } = await supabase.auth.signInWithOtp({ 
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) {
            setMessage('Error: ' + error.message);
            setMessageType('error');
        } else {
            setMessage('✨ Magic link sent! Check your email and click the link to sign in.');
            setMessageType('info');
        }
        setLoading(false);
    }

    async function signOut() {
        setLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setMessage('You have been signed out successfully.');
        setMessageType('info');
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    }

    return (
        <div className="fade-in-up">
            {message && (
                <div className={`status-message status-${messageType}`}>
                    {message}
                </div>
            )}
            
            {user ? (
                <div className="user-info">
                    <div className="user-email">
                        👋 Welcome, {user.email}
                    </div>
                    <p style={{ fontSize: '0.9rem', margin: '10px 0' }}>
                        You're all set! Now you can manage your job preferences below.
                    </p>
                    <button 
                        onClick={signOut} 
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        {loading ? <span className="loading"></span> : 'Sign Out'}
                    </button>
                </div>
            ) : (
                <div>
                    <h2>🚀 Get Started</h2>
                    <p>Enter your email to receive a magic link and start customizing your job search preferences.</p>
                    
                    <form onSubmit={signIn}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full"
                            disabled={loading || !email}
                        >
                            {loading ? (
                                <>
                                    <span className="loading"></span> Sending Magic Link...
                                </>
                            ) : (
                                '✨ Send Magic Link'
                            )}
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        <p>💡 <strong>How it works:</strong></p>
                        <ul style={{ textAlign: 'left', marginTop: '10px', paddingLeft: '20px' }}>
                            <li>Enter your email address</li>
                            <li>Check your inbox for a magic link</li>
                            <li>Click the link to sign in instantly</li>
                            <li>Set your job preferences and get matched!</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
