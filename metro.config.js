// Learn more https://docs.expo.io/guides/customizing-metro
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = 'true';
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 3D model asset extensions for Expo Metro bundler
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
