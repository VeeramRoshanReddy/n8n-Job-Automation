// src/PreferencesForm.js
import React, {useEffect, useState} from 'react';
import { supabase } from './supabaseClient';

export default function PreferencesForm(){
    const [user, setUser] = useState(null);
    const [prefs, setPrefs] = useState({
    keywords: ['software engineer'],
    locations: ['Bengaluru'],
    min_salary: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
        const u = data.session?.user;
        if(u) {
        setUser(u);
        loadPrefs(u.email);
        }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user;
        setUser(u ?? null);
        if(u) loadPrefs(u.email);
    });
    return () => listener?.subscription?.unsubscribe?.();
    }, []);

    async function loadPrefs(email){
    setLoading(true);
    const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('email', email)
        .limit(1);
    if(error) console.error(error);
    if(data && data.length){
        setPrefs(data[0].preferences || prefs);
    } else {
      // create row
        await supabase.from('users').insert({ email, preferences: prefs });
    }
    setLoading(false);
    }

    async function save(){
    setLoading(true);
    const payload = { email: user.email, preferences: prefs };
    // upsert by unique email
    const { data, error } = await supabase.from('users').upsert(payload).select();
    if(error) alert('Error saving: '+error.message);
    else alert('Preferences saved');
    setLoading(false);
    }

    if(!user) return <p>Please sign in to edit preferences.</p>

    return (
    <div>
        <h3>Your preferences</h3>
        <label>Keywords (comma separated)</label>
        <input value={(prefs.keywords||[]).join(', ')} onChange={e=>setPrefs({...prefs, keywords: e.target.value.split(',').map(s=>s.trim())})}/>
        <label>Locations (comma separated)</label>
        <input value={(prefs.locations||[]).join(', ')} onChange={e=>setPrefs({...prefs, locations: e.target.value.split(',').map(s=>s.trim())})}/>
        <label>Minimum salary (yearly INR)</label>
        <input type="number" value={prefs.min_salary || 0} onChange={e=>setPrefs({...prefs, min_salary: Number(e.target.value) || 0})}/>
        <button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</button>
    </div>
    );
}
