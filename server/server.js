const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
  🍴 ========================================================
  🍴 CampusBite - College Canteen Ordering System
  🍴 Server running at: http://localhost:${PORT}
  🍴 Health Check:      http://localhost:${PORT}/api/health
  🍴 Foods API:         http://localhost:${PORT}/api/foods
  🍴 Orders API:        http://localhost:${PORT}/api/orders
  🍴 ========================================================
  `);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
