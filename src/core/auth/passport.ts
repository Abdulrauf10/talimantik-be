import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../config/env';
import { prisma } from '../database/prisma';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  }),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0].value,
              name: profile.displayName,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
        });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
