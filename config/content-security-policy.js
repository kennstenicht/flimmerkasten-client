module.exports = function (environment) {
  return {
    delivery: ['meta'],
    enabled: environment !== 'test',
    failTests: true,
    policy: {
      'default-src': ["'none'"],
      'script-src': [
        'http://localhost:7020',
        "'self'",
        "'unsafe-inline'",
        'eval',
        "'unsafe-eval'",
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'frame-src': ["'self'", '*'],
      'connect-src': [
        "'self'",
        'https://0.peerjs.com',
        'wss://flimmerkasten.herokuapp.com/',
        '*',
      ],
      'img-src': ['data:', "'self'"],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'media-src': ["'self'"],
    },
    reportOnly: true,
  };
};
