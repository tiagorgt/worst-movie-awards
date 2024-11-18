import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { InputMovieDto } from './dto/input-movie.dto';
import { ProducerIntervalDto } from './dto/producer-interval.dto';
import { ProducerIntervalOutputDto } from './dto/producer-interval-output.dto';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async getMovies() {
    this.logger.log('Getting all movies');
    return this.movieRepository.find();
  }

  async createMovie(inputMovieDto: InputMovieDto) {
    this.logger.log(`Creating movie ${JSON.stringify(inputMovieDto)}`);
    const result = await this.movieRepository.insert(inputMovieDto);
    this.logger.log(`Movie created with id ${result.identifiers[0].id}`);
    return this.findMovieById(result.identifiers[0].id);
  }

  async updateMovie(id: number, inputMovieDto: InputMovieDto) {
    this.logger.log(`Updating movie with id ${id}`);
    const result = await this.movieRepository.update(id, inputMovieDto);

    if (result.affected === 0) {
      const message = `Movie with id ${id} not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Movie updated with id ${id}`);

    return this.findMovieById(id);
  }

  async deleteMovie(id: number) {
    this.logger.log(`Deleting movie with id ${id}`);
    const result = await this.movieRepository.delete(id);

    if (result.affected === 0) {
      const message = `Movie with id ${id} not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Movie deleted with id ${id}`);
  }

  async findMovieById(id: number) {
    this.logger.log(`Finding movie with id ${id}`);

    const result = await this.movieRepository.findOneBy({ id });

    if (!result) {
      const message = `Movie with id ${id} not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Movie found with id ${id}`);

    return result;
  }

  async getProducersWithIntervals() {
    this.logger.log('Getting producers with intervals');

    const movies = await this.movieRepository.find({ where: { winner: true } });

    const producerWins = this.groupMoviesByProducer(movies);
    const intervals = this.calculateIntervals(producerWins);
    const minIntervals = this.findMinIntervals(intervals);
    const maxIntervals = this.findMaxIntervals(intervals);

    const result: ProducerIntervalOutputDto = {
      min: intervals.filter(
        (interval) => interval.interval === minIntervals.interval,
      ),
      max: intervals.filter(
        (interval) => interval.interval === maxIntervals.interval,
      ),
    };

    this.logger.log(`Producer intervals found ${JSON.stringify(result)}`);

    return result;
  }

  private groupMoviesByProducer(movies: Movie[]): Map<string, number[]> {
    const producerWins = new Map<string, number[]>();

    movies.forEach((movie) => {
      const producers = movie.producers.split(/,| and /).map((p) => p.trim());
      producers.forEach((producer) => {
        if (!producerWins.has(producer)) {
          producerWins.set(producer, []);
        }
        producerWins.get(producer).push(movie.year);
      });
    });

    this.logger.debug(`Found ${producerWins.size} winner producers`);
    return producerWins;
  }

  private calculateIntervals(
    producerWins: Map<string, number[]>,
  ): ProducerIntervalDto[] {
    const intervals: ProducerIntervalDto[] = [];

    producerWins.forEach((years, producer) => {
      years.sort((a, b) => a - b);
      for (let i = 1; i < years.length; i++) {
        intervals.push({
          producer,
          interval: years[i] - years[i - 1],
          previousWin: years[i - 1],
          followingWin: years[i],
        });
      }
    });

    this.logger.debug(`Found ${intervals.length} intervals`);
    return intervals;
  }

  private findMinIntervals(
    intervals: ProducerIntervalDto[],
  ): ProducerIntervalDto {
    return intervals.reduce((min, current) => {
      if (current.interval < min.interval) {
        return current;
      }
      return min;
    }, intervals[0]);
  }

  private findMaxIntervals(
    intervals: ProducerIntervalDto[],
  ): ProducerIntervalDto {
    return intervals.reduce((max, current) => {
      if (current.interval > max.interval) {
        return current;
      }
      return max;
    }, intervals[0]);
  }
}
