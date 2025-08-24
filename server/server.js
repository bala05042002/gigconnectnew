const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const gigRoutes = require('./routes/gig.routes');
const chatRoutes = require('./routes/chat.routes');
const reviewRoutes = require('./routes/review.routes'); // <-- NEW IMPORT
const Chat = require('./models/Chat');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cors());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes); // <-- NEW LINE
app.use('/api/chats', require('./routes/chat.routes')); // <-- add this

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinChat', async (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { chatId, sender, content } = data;
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const newMessage = { sender, content };
      chat.messages.push(newMessage);
      await chat.save();
      
      io.to(chatId).emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));