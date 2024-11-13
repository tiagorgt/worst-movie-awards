import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';

describe('MovieController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/movies/producers (GET)', () => {
    return request(app.getHttpServer())
      .get('/movies/producers')
      .expect(200)
      .expect({
        min: [
          {
            producer: 'Producer 1',
            interval: 1,
            previousWin: 2008,
            followingWin: 2009,
          },
          {
            producer: 'Producer 2',
            interval: 1,
            previousWin: 2018,
            followingWin: 2019,
          },
        ],
        max: [
          {
            producer: 'Producer 1',
            interval: 99,
            previousWin: 1900,
            followingWin: 1999,
          },
          {
            producer: 'Producer 2',
            interval: 99,
            previousWin: 2000,
            followingWin: 2099,
          },
        ],
      });
  });
});
