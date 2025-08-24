// pages/Home.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/gigs'); // adjust if your route prefix differs
        setGigs(res.data.slice(0, 4)); // only take first 4 gigs
      } catch (err) {
        console.error('Error fetching gigs:', err);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-4">Find Your Next Gig or Freelancer</h1>
          <p className="text-xl mb-8">Connecting local clients with skilled freelancers in your community.</p>
          <Link to="/gigs/search" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition-colors duration-300">
            Explore Gigs
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">1. Post a Gig</h3>
              <p className="text-gray-600">Clients post their job requirements, budget, and location.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">2. Find Talent</h3>
              <p className="text-gray-600">Freelancers browse and apply to gigs that match their skills.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">3. Collaborate & Pay</h3>
              <p className="text-gray-600">Communicate, complete the work, and manage secure payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="bg-gray-200 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Popular Services</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {gigs.length > 0 ? (
              gigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gigs/${gig._id}`}
                  className="bg-blue-200 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-300 transition-colors"
                >
                  {gig.title}
                </Link>
              ))
            ) : (
              <span className="text-gray-600">No gigs available</span>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-800 text-white py-16 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8">Join GigConnect today and unlock your potential.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-white text-blue-800 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition-colors duration-300">
              Join as a Freelancer
            </Link>
            <Link to="/gigs" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-blue-800 transition-colors duration-300">
              Post a Gig
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} GigConnect. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="#" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 hover:text-white">Terms of Service</Link>
            <Link to="#" className="text-gray-400 hover:text-white">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
