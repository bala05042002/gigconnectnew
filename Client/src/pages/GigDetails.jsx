// pages/GigDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const user = storedUser || null;

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState(""); // ✅ state for review

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        setGig(res.data);
      } catch (err) {
        setError('Gig not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  const refreshGig = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
    setGig(res.data);
  };

  const handleApply = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/gigs/${id}/apply`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      await refreshGig();
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to apply.');
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/gigs/${id}/complete`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      await refreshGig();
      alert('Gig marked as complete!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to complete gig.');
    }
  };

  // ✅ Submit review handler
  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) {
      alert("Review cannot be empty");
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/gigs/${id}/review`,
        { review: reviewText },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setReviewText("");
      await refreshGig();
      alert("Review submitted!");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to submit review.");
    }
  };

  const handlePayClick = () => navigate(`/payment/${gig._id}`);
  const handleMessageClick = () => navigate(`/chat/${gig._id}`);

  if (loading) return <div className="text-center mt-8 text-xl">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-xl text-red-500">{error}</div>;

  const freelancerId =
    typeof gig.freelancer === 'string'
      ? gig.freelancer
      : gig.freelancer?._id;

  const isClient = user?.role === 'client' && gig.client?._id === user?.id;
  const isFreelancer = user?.role === 'freelancer' && freelancerId === user?.id;

  const hasApplied =
    user?.role === 'freelancer' &&
    gig.applicants?.some(app => app === user?.id || app?._id === user?.id);

  const canApply =
    user?.role === 'freelancer' && !hasApplied && !freelancerId;

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
      <p className="text-gray-700 mb-4">{gig.description}</p>

      <div className="text-lg mb-4">
        <p><strong>Location:</strong> {gig.location}</p>
        <p><strong>Budget:</strong> ${gig.budget}</p>
        <p><strong>Status:</strong> {gig.isCompleted ? 'Completed' : 'In Progress'}</p>
        <p><strong>Payment:</strong> {gig.isPaid ? 'Paid' : 'Unpaid'}</p>
        <p><strong>Skills Required:</strong> {gig.skillsRequired.join(', ')}</p>
        <p>
          <strong>Freelancer:</strong>{' '}
          {freelancerId ? (
            <Link to={`/profile/${freelancerId}`} className="text-blue-500 hover:underline">
              {gig.freelancer?.name || freelancerId}
            </Link>
          ) : (
            'Not yet assigned'
          )}
        </p>
      </div>

      {/* Apply */}
      {canApply && (
        <button
          onClick={handleApply}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Apply to Gig
        </button>
      )}

      {/* Applied freelancer can message */}
      {hasApplied && !freelancerId && (
        <button
          onClick={handleMessageClick}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
        >
          Message Client
        </button>
      )}

      {/* Client mark complete */}
      {isClient && !gig.isCompleted && (
        <button
          onClick={handleMarkAsComplete}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
        >
          Mark as Complete
        </button>
      )}

      {/* Freelancer finish work */}
      {isFreelancer && !gig.isCompleted && (
        <button
          onClick={handleMarkAsComplete}
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
        >
          Finish Work
        </button>
      )}

      {/* Client pay */}
      {isClient && gig.isCompleted && !gig.isPaid && (
        <button
          onClick={handlePayClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
        >
          Pay Now
        </button>
      )}

      {/* Client review textarea */}
      {isClient && gig.isCompleted && gig.isPaid && !gig.review && (
        <div className="mt-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write a review..."
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleReviewSubmit}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Show review paragraph */}
      {gig.review && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-semibold">Client’s Review:</h4>
          <p className="italic">{gig.review}</p>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
