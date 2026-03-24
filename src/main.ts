import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { WinstonModule, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonUtilities.format.nestLike('ShipIQ', {
              colors: true,
              prettyPrint: true,
              processId: true,
            }),
          ),
        }),
      ],
    }),
  });
  
  // Apply the global interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Increase payload limit for large datasets
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Enable global validation using class-validator
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Cargo Optimization Service')
    .setDescription('API for optimizing allocation of cargos into tanks')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
