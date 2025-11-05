// src/PreferencesForm.js
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PreferencesForm() {
    const [user, setUser] = useState(null);
    const [prefs, setPrefs] = useState({
        keywords: ['Software engineer', 'Developer', 'Programmer'],
        locations: ['India'],
        min_salary: 300000,
        experience_level: 'mid',
        job_type: 'full-time',
        remote_preference: 'hybrid'
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [newKeyword, setNewKeyword] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            const u = data.session?.user;
            if (u) {
                setUser(u);
                loadPrefs(u.email);
            }
        });
        
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user;
            setUser(u ?? null);
            if (u) loadPrefs(u.email);
        });
        
        return () => listener?.subscription?.unsubscribe?.();
    }, []);

    async function loadPrefs(email) {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('preferences, location')
            .eq('email', email)
            .limit(1);
            
        if (error) {
            console.error('Error loading preferences:', error);
            setMessage('Error loading preferences: ' + error.message);
            setMessageType('error');
        } else if (data && data.length) {
            setPrefs({ ...prefs, ...data[0].preferences });
            setCurrentLocation(data[0].location || '');
        } else {
            // Create new user record with default preferences
            const { error: insertError } = await supabase
                .from('users')
                .insert({ email, preferences: prefs });
                
            if (insertError) {
                console.error('Error creating user:', insertError);
            }
        }
        setLoading(false);
    }

    async function save() {
        setSaving(true);
        setMessage('');
        
        const payload = { 
            email: user.email, 
            preferences: prefs,
            location: currentLocation.trim()
        };
        
        console.log('Saving payload:', payload);
        
        const { data, error } = await supabase
            .from('users')
            .upsert(payload, { 
                onConflict: 'email',
                ignoreDuplicates: false
            })
            .select();
            
        if (error) {
            console.error('Save error:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            setMessage('Error saving preferences: ' + error.message + (error.hint ? ' (' + error.hint + ')' : ''));
            setMessageType('error');
        } else {
            console.log('Save successful:', data);
            // Verify location was saved
            if (data && data[0]) {
                console.log('Saved location value:', data[0].location);
                setCurrentLocation(data[0].location || '');
            }
            setMessage('🎉 Preferences saved successfully! Your job matches will be updated.');
            setMessageType('success');
            setTimeout(() => setMessage(''), 4000);
        }
        setSaving(false);
    }

    function addKeyword() {
        if (newKeyword.trim() && !prefs.keywords.includes(newKeyword.trim())) {
            setPrefs({
                ...prefs,
                keywords: [...prefs.keywords, newKeyword.trim()]
            });
            setNewKeyword('');
        }
    }

    function removeKeyword(keyword) {
        setPrefs({
            ...prefs,
            keywords: prefs.keywords.filter(k => k !== keyword)
        });
    }

    function addLocation() {
        if (newLocation.trim() && !prefs.locations.includes(newLocation.trim())) {
            setPrefs({
                ...prefs,
                locations: [...prefs.locations, newLocation.trim()]
            });
            setNewLocation('');
        }
    }

    function removeLocation(location) {
        setPrefs({
            ...prefs,
            locations: prefs.locations.filter(l => l !== location)
        });
    }

    if (!user) {
        return (
            <div className="glass-container fade-in-up">
                <h2>🔐 Sign In Required</h2>
                <p>Please sign in to manage your job search preferences and get personalized job recommendations.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="glass-container fade-in-up">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <span className="loading" style={{ width: '40px', height: '40px' }}></span>
                    <p style={{ marginTop: '20px' }}>Loading your preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-container fade-in-up">
            {message && (
                <div className={`status-message status-${messageType}`}>
                    {message}
                </div>
            )}
            
            <h2>🎯 Job Search Preferences</h2>
            <p>Customize your preferences to get the most relevant job recommendations delivered to your inbox.</p>
            
            <div className="form-group">
                <label>📍 Current Location City</label>
                <input
                    type="text"
                    value={currentLocation}
                    onChange={e => setCurrentLocation(e.target.value)}
                    placeholder="Enter your current city..."
                    style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)'
                    }}
                />
            </div>

            <div className="form-group">
                <label>🔍 Job Keywords & Skills</label>
                <div className="tag-input">
                    {prefs.keywords.map((keyword, index) => (
                        <span key={index} className="tag">
                            {keyword}
                            <button 
                                type="button"
                                className="tag-remove"
                                onClick={() => removeKeyword(keyword)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={e => setNewKeyword(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Add keyword..."
                    />
                </div>
                <button 
                    type="button" 
                    onClick={addKeyword}
                    className="btn btn-primary"
                    style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.9rem' }}
                    disabled={!newKeyword.trim()}
                >
                    Add Keyword
                </button>
            </div>

            <div className="form-group">
                <label>📍 Preferred Locations</label>
                <div className="tag-input">
                    {prefs.locations.map((location, index) => (
                        <span key={index} className="tag">
                            {location}
                            <button 
                                type="button"
                                className="tag-remove"
                                onClick={() => removeLocation(location)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={newLocation}
                        onChange={e => setNewLocation(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                        placeholder="Add location..."
                    />
                </div>
                <button 
                    type="button" 
                    onClick={addLocation}
                    className="btn btn-primary"
                    style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.9rem' }}
                    disabled={!newLocation.trim()}
                >
                    Add Location
                </button>
            </div>

            <div className="form-group">
                <label>💰 Minimum Annual Salary (INR)</label>
                <input
                    type="number"
                    value={prefs.min_salary || 0}
                    onChange={e => setPrefs({ ...prefs, min_salary: Number(e.target.value) || 0 })}
                    placeholder="500000"
                    min="0"
                    step="50000"
                />
                <small style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    Set your minimum expected salary to filter relevant opportunities
                </small>
            </div>

            <div className="form-group">
                <label>🎓 Experience Level</label>
                <select
                    value={prefs.experience_level || 'mid'}
                    onChange={e => setPrefs({ ...prefs, experience_level: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                </select>
            </div>

            <div className="form-group">
                <label>💼 Job Type</label>
                <select
                    value={prefs.job_type || 'full-time'}
                    onChange={e => setPrefs({ ...prefs, job_type: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                </select>
            </div>

            <div className="form-group">
                <label>🏠 Remote Work Preference</label>
                <select
                    value={prefs.remote_preference || 'hybrid'}
                    onChange={e => setPrefs({ ...prefs, remote_preference: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <option value="remote">Fully Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                    <option value="any">Any</option>
                </select>
            </div>

            <button 
                onClick={save} 
                disabled={saving}
                className="btn btn-success btn-full"
                style={{ marginTop: '20px' }}
            >
                {saving ? (
                    <>
                        <span className="loading"></span> Saving Preferences...
                    </>
                ) : (
                    '💾 Save Preferences'
                )}
            </button>

            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>🚀 How It Works</h4>
                <ul style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <li>Our AI scans thousands of job postings every 12 hours</li>
                    <li>Matches your preferences with relevant opportunities</li>
                    <li>Sends you personalized job recommendations via email</li>
                    <li>Only shows you jobs you haven't seen before</li>
                    <li>Updates automatically as new positions become available</li>
                </ul>
            </div>
        </div>
    );
}
