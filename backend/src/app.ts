import { errorHandler } from '@/middleware/error.middleware';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// Routes
import authRoutes from '@/routes/auth.routes';
import connectionRoutes from '@/routes/connections.routes';
import mediaRoutes from '@/routes/media.routes';
import moodRoutes from '@/routes/moods.routes';
import notificationRoutes from '@/routes/notification.routes';
import postRoutes from '@/routes/posts.routes';
import storyRoutes from '@/routes/stories.routes';
import userRoutes from '@/routes/users.routes';

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
