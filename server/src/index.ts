import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import weatherRouter from './routes/weather.js';
import skyRouter from './routes/sky.js';
import apodRouter from './routes/apod.js';
import satellitesRouter from './routes/satellites.js';
import galleryRouter from './routes/gallery.js';
import dsoRouter from './routes/dso.js';
import topObjectsRouter from './routes/topObjects.js';
import { initCloudinary } from './services/cloudinary.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3002');

// CORS: allow local dev and production frontend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        /\.vercel\.app$/,
    ],
}));

app.use(express.json());

// Initialize Cloudinary
initCloudinary();

// Routes
app.use('/api/weather', weatherRouter);
app.use('/api/sky', skyRouter);
app.use('/api/apod', apodRouter);
app.use('/api/satellites', satellitesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/dso', dsoRouter);
app.use('/api/top-objects', topObjectsRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`[AstroView Server] Running on http://localhost:${PORT}`);
    console.log(`[AstroView Server] Default location: ${process.env.DEFAULT_LAT}°N, ${process.env.DEFAULT_LON}°E`);
});
