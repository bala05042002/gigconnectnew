// pages/GigSearch.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GigSearch = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('');

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/search`, {
        params: {
          query: searchTerm || undefined,
          location: location || undefined,
          skills: skills || undefined,
          minBudget: minBudget || undefined,
          maxBudget: maxBudget || undefined,
        },
      });

      let gigsData = res.data || [];

      // Frontend sorting
      if (sortBy === 'budget-asc') gigsData.sort((a, b) => a.budget - b.budget);
      if (sortBy === 'budget-desc') gigsData.sort((a, b) => b.budget - a.budget);
      if (sortBy === 'date-desc') gigsData.sort(
        (a, b) => new Date(b.datePosted) - new Date(a.datePosted)
      );

      setGigs(gigsData);
    } catch (err) {
      console.error('Error fetching gigs:', err);
      setGigs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs();
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Find Gigs</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by title or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="number"
            placeholder="Min Budget"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort By</option>
            <option value="budget-asc">Budget: Low to High</option>
            <option value="budget-desc">Budget: High to Low</option>
            <option value="date-desc">Newest</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Search
        </button>
      </form>

      <div>
        {loading ? (
          <p className="text-center text-xl">Loading gigs...</p>
        ) : gigs.length === 0 ? (
          <p className="text-center text-gray-500">No gigs found. Try adjusting your search criteria.</p>
        ) : (
          <ul className="space-y-4">
            {gigs.map((gig) => (
              <li
                key={gig._id}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer transition-transform duration-200 transform hover:scale-[1.01]"
              >
                <Link to={`/gigs/${gig._id}`}>
                  <h3 className="text-2xl font-semibold mb-2">{gig.title}</h3>
                  <p className="text-gray-600 mb-2">{gig.description}</p>
                  <div className="flex flex-wrap items-center text-sm text-gray-500">
                    <span className="mr-4">📍 {gig.location}</span>
                    <span className="mr-4">💰 ${gig.budget}</span>
                    <span>🛠️ {gig.skillsRequired.join(', ')}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GigSearch;
