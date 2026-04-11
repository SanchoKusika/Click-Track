import { NestFactory } from '@nestjs/core';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AppModule } from '../app.module';
import { createSwaggerDocument } from './document';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = createSwaggerDocument(app);
  const outputPath = resolve(process.cwd(), '..', 'swagger.json');

  await writeFile(outputPath, JSON.stringify(document, null, 2));
  await app.close();

  process.stdout.write(`Swagger spec generated at ${outputPath}\n`);
}

generateSwagger().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
