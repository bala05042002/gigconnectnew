// pages/SubmitReview.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SubmitReview = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}`);
        setGig(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        alert('Failed to load gig details.');
      }
    };
    fetchGig();
  }, [gigId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'client') {
      alert('Only clients can submit reviews.');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reviews`,
        {
          gigId,
          freelancerId: gig.freelancer._id,
          rating,
          comment,
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      alert('Review submitted successfully!');
      navigate(`/gigs/${gigId}`);
    } catch (err) {
      console.error(err.response?.data?.msg || 'An error occurred.');
      alert(err.response?.data?.msg || 'Failed to submit review.');
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  if (!gig || !gig.freelancer) {
    return <p className="text-center mt-8 text-red-500">Gig or freelancer details not found.</p>;
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md mt-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Submit a Review for {gig.freelancer.name}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Rating</label>
          <select
            name="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Fair</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Terrible</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Comment</label>
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Share your experience..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default SubmitReview;