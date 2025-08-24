import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const GigDashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useContext(AuthContext);
  const [applicantsByGig, setApplicantsByGig] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGigsAndApplicants = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1️⃣ Fetch gigs
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/gigs?client=${user._id}`,
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        const gigsData = res.data;
        setGigs(gigsData);

        // 2️⃣ Fetch applicants for each gig
        const newApplicantsByGig = {};

        for (const gig of gigsData) {
          if (gig.applicants.length > 0) {
            // Parallel requests for all applicants of this gig
            const requests = gig.applicants.map(id =>
              axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/applicants/${id}`)
            );
            const responses = await Promise.all(requests);

            // Store full applicant objects for this gig
            newApplicantsByGig[gig._id] = responses.map(r => r.data.applicant);
          } else {
            newApplicantsByGig[gig._id] = [];
          }
        }

        setApplicantsByGig(newApplicantsByGig);
      } catch (err) {
        console.error(err.response?.data?.msg || 'Error fetching gigs or applicants');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) fetchGigsAndApplicants();
  }, [user, authLoading]);

  const handleOpenChat = (gigId) => {
    navigate(`/chat/${gigId}`);
  };

  if (authLoading || loading) return <p className="text-center mt-8">Loading...</p>;

  if (!user || user.role !== 'client') {
    return <p className="text-center mt-8 text-xl text-red-500">Access denied. Only clients can view this page.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Gigs Dashboard</h1>
      <div className="flex justify-center mb-6">
        <Link
          to="/gigs/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Post a New Gig
        </Link>
      </div>

      {gigs.length === 0 ? (
        <p className="text-center text-gray-500">You have not posted any gigs yet. Post one to get started!</p>
      ) : (
        <ul className="space-y-4">
          {gigs.map((gig) => (
            <li key={gig._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-2">{gig.title}</h3>
              <p className="text-gray-600 mb-2">{gig.description}</p>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3">
                <span className="mr-4">📍 Location: {gig.location}</span>
                <span className="mr-4">💰 Budget: ${gig.budget}</span>
                <span>🛠️ Skills: {gig.skillsRequired.join(', ')}</span>
              </div>

              {/* Applicants Section */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Applicants:</h4>
                {applicantsByGig[gig._id]?.length > 0 ? (
                  <ul className="space-y-2">
                    {applicantsByGig[gig._id]?.length > 0 ? (
                      <ul className="space-y-2">
                        {applicantsByGig[gig._id].map((applicant) =>
                          applicant ? (  // check if applicant is not null
                            <li
                              key={applicant._id}
                              className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-md"
                            >
                              <span>{applicant.name} ({applicant.email})</span>
                              <button
                                onClick={() => handleOpenChat(gig._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                              >
                                Open Chat
                              </button>
                            </li>
                          ) : null
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No applicants yet.</p>
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500">No applicants yet.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GigDashboard;
