import express from 'express';
import prisma from '../prisma/prisma_connection.js';

const router = express.Router();

// Create Event
router.post('/', async (req, res) => {
  const { title, dateTime, location, capacity } = req.body;

  if (!title || !dateTime || !location || !capacity || capacity <= 0 || capacity > 1000) {
    return res.status(400).json({ message: 'Invalid event input' });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        dateTime: new Date(dateTime),
        location,
        capacity: Number(capacity),
      },
    });

    res.status(201).json({ eventId: event.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// List upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();

    const upcomingEvents = await prisma.event.findMany({
      where: {
        dateTime: {
          gt: today,
        },
      },
      orderBy: [
        { dateTime: 'asc' },
        { location: 'asc' },
      ],
    });

    res.json({ upcomingEvents });
  } catch (err) {
    console.error('Upcoming Events Error:', err);
    res.status(500).json({ message: 'Error fetching upcoming events', error: err.message });
  }
});

// Get Event Details 
router.get('/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: { user: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registeredUsers = event.registrations.map(r => ({
      id: r.user.id,
      name: r.user.name,
      email: r.user.email
    }));

    res.json({ ...event, registeredUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching event' });
  }
});



// Register for Event
router.post('/:id/register', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { userId } = req.body;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const alreadyRegistered = await prisma.registration.findFirst({
      where: { userId, eventId }
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const totalRegistrations = await prisma.registration.count({
      where: { eventId }
    });

    if (totalRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (new Date(event.dateTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot register for past event' });
    }

    await prisma.registration.create({
      data: { userId, eventId }
    });

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Cancel Registration
router.delete('/:id/register/:userId', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);

  try {
    const registration = await prisma.registration.findFirst({
      where: { userId, eventId }
    });

    if (!registration) {
      return res.status(404).json({ message: 'User is not registered for this event' });
    }

    await prisma.registration.delete({
      where: { id: registration.id }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});


// Event Stats
router.get('/:id/stats', async (req, res) => {
  const eventId = parseInt(req.params.id);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalRegistrations = await prisma.registration.count({
      where: { eventId },
    });

    const remainingCapacity = event.capacity - totalRegistrations;
    const percentageUsed = ((totalRegistrations / event.capacity) * 100).toFixed(2);

    res.json({
      eventId: event.id,
      title: event.title,
      totalRegistrations,
      remainingCapacity,
      percentageUsed: `${percentageUsed}%`,
    });
  } catch (err) {
    console.error('Event Stats Error:', err);
    res.status(500).json({ message: 'Error getting event stats' });
  }
});


export default router;
