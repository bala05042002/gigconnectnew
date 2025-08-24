
// pages/CreateGig.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    skillsRequired: '',
  });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!user || user.role !== 'client') {
            alert('Only clients can post gigs.');
            return;
        }

        try {
            const skillsArray = formData.skillsRequired
            ? formData.skillsRequired.toString().split(',').map(skill => skill.trim())
            : [];

            const gigData = {
            ...formData,
            skillsRequired: skillsArray,
            client: user._id,
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/gigs`, gigData, {
            headers: {
                'x-auth-token': localStorage.getItem('token'),
            },
            });

            alert('Gig posted successfully!');
            navigate('/gigs');
        } catch (err) {
            console.error(err.response?.data?.msg || 'An error occurred.');
            alert(err.response?.data?.msg || 'Failed to post gig.');
        }
    };



  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md mt-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Post a New Gig
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Budget ($)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Skills Required (comma-separated)</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., React.js, Node.js, UI/UX Design"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Post Gig
        </button>
      </form>
    </div>
  );
};

export default CreateGig;