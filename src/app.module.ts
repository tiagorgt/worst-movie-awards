import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie/movie.entity';
import { APP_FILTER } from '@nestjs/core';
import { CatchEverythingFilter } from './exception/catch-everything.filter';
import { ProducerModule } from './producer/producer.module';
import { Producer } from './producer/producer.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      logging: false,
      entities: [Movie, Producer],
    }),
    MovieModule,
    ProducerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
