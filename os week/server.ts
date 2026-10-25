import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.HTTP_PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));

// Storage configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  },
});

// Mock database
const users: Record<string, any> = {
  1: {
    id: 1,
    email: 'user@test.com',
    username: 'testuser',
    password: '$2b$10$3djl2k0WzyJCrTow2BUg8.AoYPK/yVwMfGcVsxNhed6DJV5nesCaq', // password: "test123"
  },
};

const documents: Record<string, any> = {};
const sessions: Record<string, any> = {};

// Authentication Middleware
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req: any, res: any) => {
  const { email, username, password } = req.body;

  // Check if user exists
  const exists = Object.values(users).find((u: any) => u.email === email);
  if (exists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    email,
    username,
    password: hashedPassword,
  };

  users[newUser.id] = newUser;

  const token = jwt.sign({ id: newUser.id, email, username }, JWT_SECRET, {
    expiresIn: '24h',
  });

  res.json({ token, user: { id: newUser.id, email, username } });
});

app.post('/api/auth/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = Object.values(users).find((u: any) => u.email === email) as any;
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
    expiresIn: '24h',
  });

  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

// PDF Upload Routes
app.post('/api/documents/upload', verifyToken, upload.single('pdf'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const document = {
    id: Date.now().toString(),
    name: req.file.originalname,
    filename: req.file.filename,
    file_path: req.file.path,
    userId: req.user.id,
    uploadedAt: new Date(),
    pages: 0, // would be extracted from PDF
  };

  documents[document.id] = document;

  res.json(document);
});

app.get('/api/documents/:id', verifyToken, (req: any, res: any) => {
  const doc = documents[req.params.id];
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.userId !== req.user.id && !doc.isPublic) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.download(doc.file_path, doc.name);
});

// Session Management Routes
app.post('/api/sessions', verifyToken, (req: any, res: any) => {
  const { documentId, annotations, currentSlide, isPublic } = req.body;

  const session = {
    id: Date.now().toString(),
    documentId,
    userId: req.user.id,
    annotations: annotations || [],
    currentSlide: currentSlide || 1,
    startedAt: new Date(),
    updatedAt: new Date(),
    isPublic: isPublic || false,
    shareToken: isPublic ? Math.random().toString(36).substring(2, 15) : null,
  };

  sessions[session.id] = session;

  res.json(session);
});

app.get('/api/sessions/:id', verifyToken, (req: any, res: any) => {
  const session = sessions[req.params.id];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(session);
});

app.put('/api/sessions/:id', verifyToken, (req: any, res: any) => {
  const session = sessions[req.params.id];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { annotations, currentSlide } = req.body;
  session.annotations = annotations || session.annotations;
  session.currentSlide = currentSlide || session.currentSlide;
  session.updatedAt = new Date();

  res.json(session);
});

app.get('/api/sessions/user/list', verifyToken, (req: any, res: any) => {
  const userSessions = Object.values(sessions).filter((s: any) => s.userId === req.user.id);
  res.json(userSessions);
});

// Public Session (via share token)
app.get('/api/sessions/share/:token', (req: any, res: any) => {
  const session = Object.values(sessions).find((s: any) => s.shareToken === req.params.token) as any;
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'OK', port: PORT });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎯 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
