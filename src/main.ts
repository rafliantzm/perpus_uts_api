import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // RESTful API Prefix /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'api/docs', 'api/docs-json'],
  });

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Exception Filter & Response Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Sistem Informasi Perpustakaan REST API')
    .setDescription(
      'Spesifikasi RESTful API Sistem Informasi Perpustakaan Sederhana untuk demonstrasi tugas perkuliahan. Menggunakan endpoint /api/v1.',
    )
    .setVersion('1.0.0')
    .addTag('Dashboard', 'Ringkasan metrik perpustakaan')
    .addTag('Books', 'Manajemen katalog buku dan stok eksemplar')
    .addTag('Members', 'Manajemen data anggota perpustakaan (NIM unik)')
    .addTag('Loans', 'Transaksi peminjaman dan pengembalian buku')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Perpustakaan API - Swagger UI',
  });

  // Export Swagger JSON spec for Postman import
  const postmanDir = path.join(process.cwd(), 'postman');
  if (!fs.existsSync(postmanDir)) {
    fs.mkdirSync(postmanDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(postmanDir, 'openapi-spec.json'),
    JSON.stringify(document, null, 2),
    'utf-8',
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Perpustakaan API] Server running on http://localhost:${port}`);
  console.log(`[Perpustakaan API] Swagger UI at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('[Perpustakaan API] Failed to start server:', err);
});
