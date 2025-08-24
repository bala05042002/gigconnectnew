
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FreelancerDashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreelancerGigs = async () => {
      if (!user || user.role !== 'freelancer') {
        setLoading(false);
        return;
      }
      try {
        // FreelancerDashboard.jsx
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/freelancer/dashboard`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });


        setGigs(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch freelancer gigs.');
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancerGigs();
  }, [user]);

  const handleChat = (gigId) => {
    navigate(`/chat/${gigId}`);
  };

  if (loading) return <p className="text-center mt-8">Loading your gigs...</p>;
  if (!user || user.role !== 'freelancer')
    return (
      <p className="text-center mt-8 text-xl text-red-500">
        Access denied. Only freelancers can view this page.
      </p>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        My Gig Applications
      </h1>
      {gigs.length === 0 ? (
        <p className="text-center text-gray-500">
          You have not applied for or been assigned to any gigs yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {gigs.map((gig) => {
            const freelancerId = gig.freelancer?._id || gig.freelancer;
            const isAssigned = freelancerId === user._id;
            const hasApplied =
              gig.applicants?.map((id) => id.toString()).includes(user._id) &&
              !isAssigned;

            return (
              <li
                key={gig._id}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <Link to={`/gigs/${gig._id}`} className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{gig.title}</h3>
                  <p className="text-gray-600 mb-2">{gig.description}</p>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2">
                    <span className="mr-4">📍 {gig.location}</span>
                    <span className="mr-4">💰 ${gig.budget}</span>
                    <span>🛠️ {gig.skillsRequired.join(', ')}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {isAssigned
                      ? '✅ Assigned to you'
                      : hasApplied
                      ? '⏳ Applied, waiting for assignment'
                      : ''}
                  </p>
                </Link>

                {isAssigned && (
                  <button
                    onClick={() => handleChat(gig._id)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg mt-2 md:mt-0 md:ml-4"
                  >
                    💬 Chat with Client
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FreelancerDashboard;
