import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/auth/HomePage'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import OTPverification from './pages/auth/OTPverification.jsx'
import OAuthRedirect from './pages/auth/OAuthRedirect'

import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import UploadMaterial from './pages/dashboard/UploadMaterial.jsx'

import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/otp-verification" element={<OTPverification />} />
            <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
            <Route path="/dashboard" element={<DashboardHome />} />

            <Route path="/dashboard/upload" element={<UploadMaterial />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
