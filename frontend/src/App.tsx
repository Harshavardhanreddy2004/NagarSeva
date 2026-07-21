import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ReportIssue from './pages/ReportIssue'
import MyComplaints from './pages/MyComplaints'
import ComplaintDetail from './pages/ComplaintDetail'
import Dashboard from './pages/Dashboard'
import SafetyMap from './pages/SafetyMap'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen bg-transparent">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-complaints" element={<MyComplaints />} />
              <Route path="/complaint/:id" element={<ComplaintDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/safety-map" element={<SafetyMap />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  )
}

export default App
