import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes';
import './core/auth/passport';
import passport from 'passport';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

export default app;
