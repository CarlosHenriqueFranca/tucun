import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

export interface FacebookProfile {
  facebookId: string;
  email: string | null;
  name: string;
  picture: string | null;
  accessToken: string;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'PLACEHOLDER_CONFIGURE_IN_ENV',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'PLACEHOLDER_CONFIGURE_IN_ENV',
      callbackURL: `${configService.get<string>('API_URL', 'http://localhost:3333')}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
      scope: ['email', 'public_profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: unknown, user?: unknown) => void,
  ): Promise<void> {
    const { id, displayName, emails, photos } = profile;

    const facebookProfile: FacebookProfile = {
      facebookId: id,
      email: emails?.[0]?.value ?? null,
      name: displayName || '',
      picture: photos?.[0]?.value ?? null,
      accessToken,
    };

    done(null, facebookProfile);
  }
}
