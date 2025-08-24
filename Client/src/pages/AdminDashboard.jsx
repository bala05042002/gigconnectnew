// pages/AdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'admin') {
        try {
          const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
            headers: { 'x-auth-token': localStorage.getItem('token') },
          });
          const gigsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/gigs`, {
            headers: { 'x-auth-token': localStorage.getItem('token') },
          });
          setUsers(usersRes.data);
          setGigs(gigsRes.data);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
          alert('Failed to fetch admin data.');
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully.');
      } catch (err) {
        console.error(err);
        alert('Failed to delete user.');
      }
    }
  };

  const deleteGig = async (gigId) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/gigs/${gigId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setGigs(gigs.filter(g => g._id !== gigId));
        alert('Gig deleted successfully.');
      } catch (err) {
        console.error(err);
        alert('Failed to delete gig.');
      }
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  if (!user || user.role !== 'admin') {
    return <p className="text-center mt-8 text-xl text-red-500">Access denied. Only administrators can view this page.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{u.name}</td>
                  <td className="py-3 px-6 text-left">{u.email}</td>
                  <td className="py-3 px-6 text-left">{u.role}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Gigs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Client</th>
                <th className="py-3 px-6 text-left">Budget</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {gigs.map((g) => (
                <tr key={g._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{g.title}</td>
                  <td className="py-3 px-6 text-left">{g.client?.name || 'N/A'}</td>
                  <td className="py-3 px-6 text-left">${g.budget}</td>
                  <td className="py-3 px-6 text-left">{g.isCompleted ? 'Completed' : 'In Progress'}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => deleteGig(g._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;