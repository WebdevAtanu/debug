import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userModel.js';
import { extractUsernameFromEmail, cookieExtractor } from '../utils/index.js';

const JwtAuthCallback = async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.sub);
    if (!user) return done(null, false);

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
};

const GoogleAuthCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    console.log(accessToken, profile);
    // find user with googleId
    const user = await User.findByGoogleId(profile.id);
    if (user) {
      return done(null, user);
    }

    // check for existing user with same email as google email
    const existingUser = await User.findByEmail(profile._json.email);
    if (existingUser) {
      // if we have a user with same email then we will link
      // the google account with local login credentials
      console.log('User already exist with same email');
      console.log('LINK ACCOUNT');
      const provider = JSON.parse(existingUser.provider || '[]');
      provider.push('google');
      const savedUser = await User.updateById(existingUser.id, {
        provider: JSON.stringify(provider),
        googleId: profile.id,
      });
      return done(null, savedUser);
    }

    // user does not exist let's create a new user
    console.log('User does not exist');
    const savedUser = await User.create({
      username: extractUsernameFromEmail(profile._json.email),
      name: profile.displayName,
      provider: ['google'],
      googleId: profile.id,
      avatarUrl: profile._json.picture,
      email: profile._json.email,
    });
    return done(null, savedUser);
  } catch (err) {
    return done(err, false);
  }
};

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/user/auth/google/callback',
      // passReqToCallback: true
    },
    GoogleAuthCallback
  )
);

passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.TOKEN_SECRET,
    },
    JwtAuthCallback
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
