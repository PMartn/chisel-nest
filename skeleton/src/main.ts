import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger } from 'pino-nestjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app-config.service';

function setupSwagger(app: INestApplication): void {
  const configService = app.get(AppConfigService);

  if (configService.isProduction) return;

  const config = new DocumentBuilder()
    .setTitle('Chisel API')
    .setDescription('API documentation.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
