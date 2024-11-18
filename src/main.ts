import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Movie } from './movie/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { importCsvData } from './data/import-data';
import helmet from 'helmet';
import { Producer } from './producer/producer.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
  const producerRepository = app.get<Repository<Producer>>(
    getRepositoryToken(Producer),
  );
  await importCsvData(movieRepository, producerRepository);

  await app.listen(3000);
}
bootstrap();
