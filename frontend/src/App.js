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
import React from 'react';
import Login from './Login';
import PreferencesForm from './PreferencesForm';
import './index.css';

function App() {
  return (
    <div className="container">
      <h1>Automated Job Aggregator</h1>
      <p>Signed-in users can save preferences here. n8n will use these preferences to pull jobs every 12 hours.</p>
      <Login />
      <hr/>
      <PreferencesForm />
    </div>
  );
}

export default App;
