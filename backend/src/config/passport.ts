import passport from 'passport';
import { OAuthService } from '../services/auth/OAuthService';
import { UserRepository } from '../repositories/UserRepository';
import { AppDataSource } from '../app';

// Initialize OAuth service with user repository
let oauthService: OAuthService;
let userRepository: UserRepository;

function getOAuthService() {
  if (!oauthService) {
    userRepository = new UserRepository(AppDataSource);
    oauthService = new OAuthService(userRepository);
  }
  return oauthService;
}

// Configure passport strategies
export function configurePassport() {
  const oauth = getOAuthService();

  // Configure Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use('google', oauth.configureGoogleStrategy());
  }

  // Temporarily disabled until passport dependencies are installed
  // Configure Apple Strategy (if credentials are provided)
  // if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID) {
  //   passport.use('apple', oauth.configureAppleStrategy());
  // }

  // Configure Microsoft Strategy (if credentials are provided)
  // if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  //   passport.use('microsoft', oauth.configureMicrosoftStrategy());
  // }

  // Serialize user for session (required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (required by passport)
  passport.deserializeUser(async (id: string, done) => {
    try {
      if (!userRepository) {
        userRepository = new UserRepository(AppDataSource);
      }
      const user = await userRepository.findOne({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
