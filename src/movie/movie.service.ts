import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { InputMovieDto } from './dto/input-movie.dto';
import { ProducerIntervalDto } from './dto/producer-interval.dto';
import { ProducerIntervalOutputDto } from './dto/producer-interval-output.dto';
import { ProducerService } from '../producer/producer.service';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @Inject(ProducerService) private producerService: ProducerService,
  ) {}

  async getMovies() {
    this.logger.log('Getting all movies');
    return this.movieRepository.find({ relations: ['producers'] });
  }

  async createMovie(inputMovieDto: InputMovieDto) {
    this.logger.log(`Creating movie ${JSON.stringify(inputMovieDto)}`);

    const { title, year, winner, producerIds, studios } = inputMovieDto;

    const movie = this.movieRepository.create({ title, year, winner, studios });

    const producerEntities =
      await this.producerService.findProducersByIds(producerIds);

    movie.producers = producerEntities;

    const result = await this.movieRepository.save(movie);

    this.logger.log(`Movie created with id ${result.id}`);

    return result;
  }

  async updateMovie(id: number, inputMovieDto: InputMovieDto) {
    this.logger.log(`Updating movie with id ${id}`);

    const { title, studios, winner, producerIds, year } = inputMovieDto;

    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    movie.title = title;
    movie.year = year;
    movie.winner = winner;
    movie.studios = studios;

    const producerEntities =
      await this.producerService.findProducersByIds(producerIds);

    movie.producers = producerEntities;

    await this.movieRepository.save(movie);

    this.logger.log(`Movie updated with id ${id}`);

    return movie;
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

    const result = await this.movieRepository.findOne({
      where: { id },
      relations: ['producers'],
    });

    if (!result) {
      const message = `Movie with id ${id} not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Movie found with id ${id}`);

    return result;
  }

  async getProducersWithIntervals(): Promise<ProducerIntervalOutputDto> {
    this.logger.log('Getting producers with intervals');

    const movies = await this.movieRepository.find({
      where: { winner: true },
      relations: ['producers'],
    });

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
      movie.producers.forEach((producer) => {
        const formattedId = `${producer.id}|${producer.name}`;
        if (!producerWins.has(formattedId)) {
          producerWins.set(formattedId, []);
        }
        producerWins.get(formattedId).push(movie.year);
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

      const formattedProducer = producer.split('|')[1];

      for (let i = 1; i < years.length; i++) {
        intervals.push({
          producer: formattedProducer,
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
