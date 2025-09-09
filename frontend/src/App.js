/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import PreferencesForm from './PreferencesForm';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--primary-gradient)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="loading" style={{ width: '50px', height: '50px' }}></span>
          <p style={{ marginTop: '20px', color: 'white', fontSize: '1.1rem' }}>
            Loading your job automation dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="glass-container fade-in-up">
        <h1>🚀 Smart Job Automation</h1>
        <p>
          Your personal job search assistant that finds and delivers the perfect opportunities 
          directly to your inbox. Set your preferences once and let AI do the rest!
        </p>
        
        <Login />
        
        {user && (
          <>
            <div className="divider"></div>
            <PreferencesForm />
          </>
        )}
        
        {!user && (
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>
              🎯 Why Choose Our Platform?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{ padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤖</div>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>AI-Powered</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Advanced algorithms match your skills with the perfect opportunities
                </p>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Real-Time</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Get notified instantly when new matching jobs are posted
                </p>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Personalized</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Customized recommendations based on your unique preferences
                </p>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Email Delivery</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Receive curated job lists directly in your inbox
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
