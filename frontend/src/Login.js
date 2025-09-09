// src/Login.js
import React, {useEffect, useState} from 'react';
import { supabase } from './supabaseClient';

export default function Login(){
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe?.();
    }, []);

    async function signIn(e){
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if(error) alert('Error: ' + error.message);
    else alert('Check your email for the magic link to sign in.');
    }

    async function signOut(){
    await supabase.auth.signOut();
    setUser(null);
    }

    return (
    <div>
        {user ? (
        <div>
            <p>Signed in as <b>{user.email}</b></p>
            <button onClick={signOut}>Sign out</button>
        </div>
        ) : (
        <form onSubmit={signIn}>
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@mail.com" required/>
            <button type="submit">Sign in (magic link)</button>
        </form>
        )}
    </div>
    );
}
