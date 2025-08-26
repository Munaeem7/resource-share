import express from 'express';
const router = express.Router();

// ✅ Simple test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

// ✅ Simple create route without auth temporarily
router.post('/create', (req, res) => {
  res.json({ message: 'User created successfully' });
});

export default router;