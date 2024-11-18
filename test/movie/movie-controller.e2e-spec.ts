import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../../src/movie/movie.entity';
import { Repository } from 'typeorm';
import { InputMovieDto } from '../../src/movie/dto/input-movie.dto';
import { importCsvData } from '../../src/data/import-data';

describe('MovieController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<Movie>;
  let moviesData: Movie[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    movieRepository = moduleFixture.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );

    await importCsvData(movieRepository);

    await app.init();

    moviesData = await movieRepository.find();
  });

  beforeEach(async () => {
    await movieRepository.query('DELETE FROM movie');
    await movieRepository.save(moviesData);
  });

  afterEach(async () => {
    await movieRepository.query('DELETE FROM movie');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/movies (GET)', () => {
    it('should return all movies', () => {
      return request(app.getHttpServer())
        .get('/movies')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toEqual(moviesData.length);
          expect(res.body).toEqual(
            expect.arrayContaining(
              moviesData.map((movie) => expect.objectContaining(movie)),
            ),
          );
        });
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should return a movie by id', async () => {
      const movie = moviesData[0];

      return request(app.getHttpServer())
        .get(`/movies/${movie.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(expect.objectContaining(movie));
        });
    });

    it('should return 404 if movie not found', () => {
      return request(app.getHttpServer()).get('/movies/999').expect(404);
    });
  });

  describe('/movies (POST)', () => {
    it('should create a movie', () => {
      const movie: InputMovieDto = {
        title: 'New Movie',
        year: 2021,
        producers: 'New Producer',
        studios: 'New Studio',
        winner: false,
      };

      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toEqual(movie.title);
          expect(res.body.year).toEqual(movie.year);
          expect(res.body.producers).toEqual(movie.producers);
          expect(res.body.studios).toEqual(movie.studios);
          expect(res.body.winner).toEqual(movie.winner);
        });
    });

    it('should return 400 if validation fails', () => {
      const movie = {
        title: 'New Movie',
        year: 'asdasd',
        producers: 'New Producer',
        studios: 'New Studio',
        winner: false,
      };

      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(400);
    });
  });

  describe('/movies/:id (PUT)', () => {
    it('should update a movie', async () => {
      const movie = moviesData[0];
      const createdMovie = await movieRepository.save(movie);
      const updatedMovie: InputMovieDto = {
        title: 'Updated Movie',
        year: 2021,
        producers: 'Updated Producer',
        studios: 'Updated Studio',
        winner: false,
      };

      return request(app.getHttpServer())
        .put(`/movies/${createdMovie.id}`)
        .send(updatedMovie)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toEqual(updatedMovie.title);
          expect(res.body.year).toEqual(updatedMovie.year);
          expect(res.body.producers).toEqual(updatedMovie.producers);
          expect(res.body.studios).toEqual(updatedMovie.studios);
          expect(res.body.winner).toEqual(updatedMovie.winner);
        });
    });

    it('should return 404 if movie not found', () => {
      const updatedMovie: InputMovieDto = {
        title: 'Updated Movie',
        year: 2021,
        producers: 'Updated Producer',
        studios: 'Updated Studio',
        winner: false,
      };

      return request(app.getHttpServer())
        .put('/movies/999')
        .send(updatedMovie)
        .expect(404);
    });

    it('should return 400 if validation fails', async () => {
      const movie = moviesData[0];
      const createdMovie = await movieRepository.save(movie);
      const updatedMovie = {
        title: 'Updated Title',
        year: 'asdasd',
        producers: 'Updated Producer',
        studios: 'Updated Studio',
        winner: false,
      };

      return request(app.getHttpServer())
        .put(`/movies/${createdMovie.id}`)
        .send(updatedMovie)
        .expect(400);
    });
  });

  describe('/movies/:id (DELETE)', () => {
    it('should delete a movie', async () => {
      const movie = moviesData[0];

      return request(app.getHttpServer())
        .delete(`/movies/${movie.id}`)
        .expect(204);
    });

    it('should return 404 if movie not found', () => {
      return request(app.getHttpServer()).delete('/movies/999').expect(404);
    });
  });

  describe('/movies/producers/intervals (GET)', () => {
    it('should return producers with intervals', async () => {
      return request(app.getHttpServer())
        .get('/movies/producers/intervals')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            min: [
              {
                producer: 'Joel Silver',
                interval: 1,
                previousWin: 1990,
                followingWin: 1991,
              },
            ],
            max: [
              {
                producer: 'Matthew Vaughn',
                interval: 13,
                previousWin: 2002,
                followingWin: 2015,
              },
            ],
          });
        });
    });
  });
});
