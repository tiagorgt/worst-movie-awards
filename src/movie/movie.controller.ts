import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { InputMovieDto } from './dto/input-movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async getMovies() {
    return this.movieService.getMovies();
  }

  @Get(':id')
  async getMovie(@Param('id') id: number) {
    return this.movieService.findMovieById(id);
  }

  @Post()
  async createMovie(@Body() inputMovieDto: InputMovieDto) {
    return this.movieService.createMovie(inputMovieDto);
  }

  @Put(':id')
  async updateMovie(
    @Param('id') id: number,
    @Body() inputMovieDto: InputMovieDto,
  ) {
    return this.movieService.updateMovie(id, inputMovieDto);
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: number) {
    return this.movieService.deleteMovie(id);
  }

  @Get('producers-intervals')
  async getProducers() {
    return this.movieService.getProducersWithIntervals();
  }
}
