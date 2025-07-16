import express from 'express';
import dotenv from 'dotenv';
import eventRoutes from './routes/events.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('🎉 Event Management API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
