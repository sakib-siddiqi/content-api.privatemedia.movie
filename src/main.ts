import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';

const logStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  console.log('⏰ App is about to start;');

  try {
    const app = await NestFactory.create(AppModule);
    app.use(morgan('combined', { stream: logStream }));
    app.use(morgan('dev'));
    app.enableCors({
      origin: '*'
    })
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server started on port : ${process.env.PORT ?? 3000}`);
    logger.log('✅ Application bootstrap completed successfully');
  } catch (error) {
    logger.error('❌ Application bootstrap failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Unhandled bootstrap error:', error);
  process.exit(1);
});
