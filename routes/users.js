import express from 'express';
import prisma from '../prisma/prisma_connection.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'Email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

export default router;
