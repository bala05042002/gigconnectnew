// pages/Chat.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as jwtDecode from 'jwt-decode'; // ✅ works with ESM

const Chat = () => {
  const { gigId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchChat = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // decode payload
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chats/${gigId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });

      setGig(res.data.gig);
      setMessages(res.data.messages);
      setLoading(false);
    } catch (err) {
      alert(err.response.data.msg)
      console.error(err.response.data.msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [gigId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/${gigId}`,
        { content: newMessage },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );

      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading chat...</p>;
  if (!gig) return <p className="text-center mt-8 text-red-500">Gig not found.</p>;


  console.log(gig)

  // ✅ Handle both string and populated objects
  const clientId = typeof gig.client === 'object' ? gig.client._id : gig.client;
  const freelancerId = typeof gig.freelancer === 'object' ? gig.freelancer._id : gig.freelancer;

  const isClient = user?.role === 'client' && (user?._id === clientId || user?.id === clientId);
  const isFreelancer = user?.role === 'freelancer' && (user?._id === freelancerId || user?.id === freelancerId);

  if (!isClient && !isFreelancer) {
    return (
      <p className="text-center mt-8 text-xl text-red-500">
        You are not authorized to view this chat.
      </p>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md mt-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Chat for Gig: {gig.title}
      </h2>

      <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg) => {
            const isClientMsg = msg.sender === clientId;

            return (
              <div
                key={msg._id || msg.timestamp}
                className={`mb-4 flex ${isClientMsg ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                    isClientMsg
                      ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                      : 'bg-blue-500 text-white rounded-br-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="block text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
