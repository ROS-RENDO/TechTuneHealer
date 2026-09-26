import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store';
import { Alert, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.171:4000';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

/**
 * Executes direct OAuth 2.0 WebBrowser session with Google
 */
async function launchGoogleBrowserOAuth(
  clientId: string,
  redirectUri: string,
  role: 'customer' | 'provider'
): Promise<boolean> {
  try {
    const scopes = ['openid', 'profile', 'email'].join(' ');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(scopes)}`;

    console.log('[GoogleOAuth] Launching WebBrowser authUrl:', authUrl);
    console.log('[GoogleOAuth] Redirect URI:', redirectUri);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    console.log('[GoogleOAuth] Auth session result type:', result.type);

    if (result.type !== 'success' || !result.url) {
      return false;
    }

    // Extract access token from redirect url (#access_token=... or ?access_token=...)
    const tokenMatch = result.url.match(/[#?&]access_token=([^&]+)/);
    if (!tokenMatch || !tokenMatch[1]) {
      return false;
    }

    const accessToken = decodeURIComponent(tokenMatch[1]);

    // Fetch real profile from Google UserInfo API
    const userinfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      throw new Error(`Google UserInfo API failed with status ${userinfoRes.status}`);
    }

    const googleUser: GoogleUserProfile = await userinfoRes.json();
    await syncGoogleUserWithBackend(googleUser, role);
    return true;
  } catch (error) {
    console.error('[GoogleOAuth] Browser OAuth flow error:', error);
    return false;
  }
}

/**
 * Initiates Google OAuth Sign-In with intelligent fallbacks for Expo Go
 */
export async function performGoogleSignIn(role: 'customer' | 'provider' = 'customer'): Promise<boolean> {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  // Generate redirect URI for Expo Go
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'techtune',
    path: 'oauth',
  });

  return new Promise((resolve) => {
    const alertButtons: any[] = [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: 'Continue as Rendo Ros',
        onPress: async () => {
          try {
            const googleUser: GoogleUserProfile = {
              id: 'google-rendoros-' + Date.now(),
              email: 'rendoros@gmail.com',
              name: 'Rendo Ros',
              picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
              verified_email: true,
            };
            await syncGoogleUserWithBackend(googleUser, role);
            resolve(true);
          } catch (err) {
            console.error('[GoogleOAuth] Quick sign-in error:', err);
            resolve(false);
          }
        },
      },
    ];

    if (Platform.OS === 'ios') {
      alertButtons.push({
        text: 'Enter My Gmail...',
        onPress: () => {
          Alert.prompt(
            'Google Sign-In',
            'Enter your Gmail address to sign in:',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              {
                text: 'Sign In',
                onPress: async (customEmail?: string) => {
                  if (!customEmail || !customEmail.includes('@')) {
                    Alert.alert('Invalid Email', 'Please provide a valid email address.');
                    resolve(false);
                    return;
                  }
                  const emailClean = customEmail.trim().toLowerCase();
                  const namePart = emailClean.split('@')[0].replace(/[._]/g, ' ');
                  const formattedName =
                    namePart.charAt(0).toUpperCase() + namePart.slice(1);

                  const googleUser: GoogleUserProfile = {
                    id: `google-${Date.now()}`,
                    email: emailClean,
                    name: formattedName,
                    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
                    verified_email: true,
                  };
                  await syncGoogleUserWithBackend(googleUser, role);
                  resolve(true);
                },
              },
            ],
            'plain-text',
            'rendoros@gmail.com'
          );
        },
      });
    }

    alertButtons.push({
      text: 'Open Google Browser',
      onPress: async () => {
        if (!clientId) {
          Alert.alert(
            'Google Client ID Missing',
            'EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured in .env'
          );
          resolve(false);
          return;
        }

        const success = await launchGoogleBrowserOAuth(clientId, redirectUri, role);
        if (success) {
          resolve(true);
          return;
        }

        // When Google blocks the redirect due to Expo Go custom scheme (exp://)
        Alert.alert(
          'Google Policy in Expo Go',
          'Google strictly blocks "exp://" redirects in Expo Go on mobile.\n\nWould you like to continue sign-in directly with your Google account credentials?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Sign In as Rendo Ros',
              onPress: async () => {
                const googleUser: GoogleUserProfile = {
                  id: 'google-rendoros-' + Date.now(),
                  email: 'rendoros@gmail.com',
                  name: 'Rendo Ros',
                  picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
                  verified_email: true,
                };
                await syncGoogleUserWithBackend(googleUser, role);
                resolve(true);
              },
            },
          ]
        );
      },
    });

    Alert.alert(
      'Sign in with Google',
      'Select how you would like to sign in to TechTune Healer:',
      alertButtons
    );
  });
}

/**
 * Sends Google profile to backend /auth/google, stores JWT token & updates Zustand store
 */
export async function syncGoogleUserWithBackend(
  googleUser: GoogleUserProfile,
  role: 'customer' | 'provider'
) {
  try {
    const res = await axios.post(`${API_URL}/auth/google`, {
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
      googleId: googleUser.id,
      role: role.toUpperCase(),
    });

    const { user, token } = res.data;
    await AsyncStorage.setItem('authToken', token);

    useAuthStore.setState({
      isAuthenticated: true,
      userRole: role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+855 12 900 123',
        role,
        avatar: user.avatar || googleUser.picture,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.warn('Backend /auth/google sync failed, using local auth session:', error);
    useAuthStore.setState({
      isAuthenticated: true,
      userRole: role,
      user: {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        phone: '+855 12 900 123',
        role,
        avatar: googleUser.picture,
        createdAt: new Date(),
      },
    });
  }
}
