import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    morgan('common', {
      skip: function (req, res) {
        return req.method == 'OPTIONS';
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Prowess API Documentation')
    .setDescription('Prowess API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3000);
}
bootstrap();
