import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GigDashboard from './pages/GigDashboard';
import GigSearch from './pages/GigSearch';
import GigDetails from './pages/GigDetails';
import Chat from './pages/Chat';
import SubmitReview from './pages/SubmitReview';
import Home from './pages/Home';
import CreateGig from './pages/CreateGig';
import AdminDashboard from './pages/AdminDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';

const App = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">GigConnect</Link>
            <div className="flex items-center">
              <Link to="/gigs/search" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">
                Find Gigs
              </Link>
              {user ? (
                <>
                  <span className="mr-4 text-gray-600">Welcome, {user.name}</span>
                  {user.role === 'freelancer' && (
                    <>
                      <Link to="/profile" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">
                        Profile
                      </Link>
                      <Link to="/gigs/freelancer" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">
                        My Gigs
                      </Link>
                    </>
                  )}
                  {user.role === 'client' && (
                    <>
                      <Link to="/gigs/new" className="mr-4 text-green-500 font-bold transition-colors duration-200 hover:text-green-700">
                        Post a Gig
                      </Link>
                      <Link to="/gigs" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">
                        My Gigs
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">
                      Admin
                    </Link>
                  )}
                  <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mr-4 text-blue-500 transition-colors duration-200 hover:text-blue-700">Login</Link>
                  <Link to="/register" className="text-blue-500 transition-colors duration-200 hover:text-blue-700">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gigs" element={<GigDashboard />} />
          <Route path="/gigs/freelancer" element={<FreelancerDashboard />} />
          <Route path="/gigs/search" element={<GigSearch />} />
          <Route path="/gigs/:id" element={<GigDetails />} />
          <Route path="/chat/:gigId" element={<Chat />} />
          <Route path="/review/:gigId" element={<SubmitReview />} />
          <Route path="/gigs/new" element={<CreateGig />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;