import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './Context/AuthContext' 
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Navbar from './components/Navbar'
import Signin from './components/Signin'
import ProfilePage from './Pages/Profilepage'
import Signup from './components/Signup'
import Dashboard from './Pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoutes'
import Footer from './components/Footer'


const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/about' element={<About/>}/>
      <Route path='/signin' element={<Signin/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/contact' element={<Contact/>}/>

      
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider> 
      <div className='text-default min-h-screen text-gray-700 bg-white'>
        <Navbar/>
        <AppRoutes />
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App