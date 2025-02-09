import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExecptionFilter } from './filter/http-execption.filter';
import { TransformInterceptor } from './interception/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExecptionFilter());
  app.setGlobalPrefix('api');

  app.useStaticAssets('uploads', {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();
