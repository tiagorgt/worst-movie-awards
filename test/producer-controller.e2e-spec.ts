import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producer } from '../src/producer/producer.entity';
import { Repository } from 'typeorm';
import { InputProducerDto } from '../src/producer/dto/input-producer.dto';
import { importCsvData } from '../src/data/import-data';
import { Movie } from '../src/movie/movie.entity';

describe('ProducerController (e2e)', () => {
  let app: INestApplication;
  let producerRepository: Repository<Producer>;
  let movieRepository: Repository<Movie>;
  let moviesData: Movie[] = [];
  let producersData: Producer[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    movieRepository = moduleFixture.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );

    producerRepository = moduleFixture.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );

    await importCsvData(movieRepository, producerRepository);

    await app.init();

    moviesData = await movieRepository.find();
    producersData = await producerRepository.find();
  });

  beforeEach(async () => {
    await movieRepository.delete('*');
    await producerRepository.save(producersData);
    await movieRepository.save(moviesData);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/producers (GET)', () => {
    it('should return all producers', () => {
      return request(app.getHttpServer())
        .get('/producers')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toEqual(producersData.length);
          expect(res.body).toEqual(
            expect.arrayContaining(
              producersData.map((producer) =>
                expect.objectContaining(producer),
              ),
            ),
          );
        });
    });
  });

  describe('/producers/:id (GET)', () => {
    it('should return a producer by id', async () => {
      const producer = producersData[0];

      return request(app.getHttpServer())
        .get(`/producers/${producer.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(expect.objectContaining(producer));
        });
    });

    it('should return 404 if producer not found', () => {
      return request(app.getHttpServer()).get('/producers/999').expect(404);
    });
  });

  describe('/producers (POST)', () => {
    it('should create a producer', () => {
      const producer: InputProducerDto = {
        name: 'New Producer',
      };

      return request(app.getHttpServer())
        .post('/producers')
        .send(producer)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toEqual(producer.name);
        });
    });

    it('should return 400 if validation fails', () => {
      const producer = {
        name: 12,
      };

      return request(app.getHttpServer())
        .post('/producers')
        .send(producer)
        .expect(400);
    });
  });

  describe('/producers/:id (PUT)', () => {
    it('should update a producer', async () => {
      const producer = producersData[0];
      const updatedProducer: InputProducerDto = {
        name: 'Updated Producer',
      };

      return request(app.getHttpServer())
        .put(`/producers/${producer.id}`)
        .send(updatedProducer)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toEqual(updatedProducer.name);
        });
    });

    it('should return 404 if producer not found', () => {
      const updatedProducer: InputProducerDto = {
        name: 'Updated Producer',
      };

      return request(app.getHttpServer())
        .put('/producers/999')
        .send(updatedProducer)
        .expect(404);
    });

    it('should return 400 if validation fails', async () => {
      const producer = producersData[0];
      const createdProducer = await producerRepository.save(producer);
      const updatedProducer = {
        name: 123,
      };

      return request(app.getHttpServer())
        .put(`/producers/${createdProducer.id}`)
        .send(updatedProducer)
        .expect(400);
    });
  });

  describe('/producers/:id (DELETE)', () => {
    it('should delete a producer', async () => {
      const newProducer = await producerRepository.save({
        name: 'new producer',
      });

      return request(app.getHttpServer())
        .delete(`/producers/${newProducer.id}`)
        .expect(204);
    });

    it('should return 404 if producer not found', () => {
      return request(app.getHttpServer()).delete('/producers/999').expect(404);
    });
  });
});
