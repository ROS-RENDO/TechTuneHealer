/**
 * Centralized API & WebSocket Endpoint Configuration
 * Automatically uses EXPO_PUBLIC_API_URL or defaults to your local development server.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.171:4000';
export const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

export default API_BASE_URL;
