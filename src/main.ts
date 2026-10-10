import { appConfig } from './config/app.config.js';
import { databaseService } from './database/database.service.js';
import { createHttpServer } from './http/http.server.js';
import { chatGateway } from './gateway/chat.gateway.js';

async function bootstrap() {
  console.log(`[Bootstrap] Starting Multilingual Chat Assistant v1.0.0...`);

  // 1. Initialize Database
  await databaseService.initialize();

  // 2. Create HTTP Server
  const server = createHttpServer();

  // 3. Attach WebSocket Gateway
  chatGateway.initialize(server);

  // 4. Start Listening
  server.listen(appConfig.port, appConfig.host, () => {
    console.log(`[Server] HTTP and WebSockets listening on http://${appConfig.host}:${appConfig.port}`);
    console.log(`[Server] Web Interface available at http://localhost:${appConfig.port}`);
    console.log(`[Server] WebSocket endpoint: ws://localhost:${appConfig.port}/ws`);
    console.log(`[Server] Health check: http://localhost:${appConfig.port}/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Server] Shutting down gracefully...');
    chatGateway.close();
    await databaseService.close();
    server.close(() => {
      console.log('[Server] Closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]', err);
  process.exit(1);
});
