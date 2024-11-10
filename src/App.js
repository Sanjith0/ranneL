import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';

// Placeholder for your next page
const MainPage = () => (
  <div className="min-h-screen bg-ingrediate-beige p-5">
    <h1 className="text-4xl font-serif">Main Page</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;