import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    portfolio: '',
    rate: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profiles/me`, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        setProfile(res.data);
        setFormData({
          bio: res.data.bio || '',
          skills: res.data.skills.join(', ') || '',
          portfolio: res.data.portfolio || '',
          rate: res.data.rate || '',
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim());
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/profiles`,
        { ...formData, skills: skillsArray },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      setProfile(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err.response.data);
      alert(err.response?.data?.msg || 'Failed to update profile.');
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading profile...</p>;
  }

  if (!user || user.role !== 'freelancer') {
    return <p className="text-center mt-8 text-xl text-red-500">Access denied. Only freelancers can view this page.</p>;
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md mt-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Profile</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Tell us about yourself and your experience..."
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., React, Node.js, UI/UX Design"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Portfolio Link</label>
          <input
            type="text"
            name="portfolio"
            value={formData.portfolio}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., https://yourportfolio.com"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Hourly Rate ($)</label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={onChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 50"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {profile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>

      {profile && profile.reviews && profile.reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Reviews ({profile.reviews.length})</h3>
          <ul className="space-y-4">
            {profile.reviews.map(review => (
              <li key={review._id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-xl font-bold text-yellow-500">{'★'.repeat(review.rating)}</span>
                  <span className="ml-2 text-gray-600">({review.rating}/5)</span>
                </div>
                <p className="text-gray-700">"{review.comment}"</p>
                <p className="text-sm text-gray-400 mt-2">- {review.client.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;