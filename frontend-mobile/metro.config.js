const { getDefaultConfig } = require('expo/metro-config');

// Metro on Windows: if this file throws, Metro falls back to `import("C:\\...")`
// which fails with ERR_UNSUPPORTED_ESM_URL_SCHEME. Never throw after startup.
const config = getDefaultConfig(__dirname);

try {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, { input: './global.css' });
} catch (err) {
  console.warn(
    '[metro] NativeWind tidak dimuat (npm install belum lengkap?). Pakai Metro default.',
    err && err.message ? `— ${err.message}` : ''
  );
  module.exports = config;
}
