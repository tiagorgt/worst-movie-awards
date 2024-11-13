import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
    return await this.movieService.getMovies();
  }

  @Get(':id')
  async getMovie(@Param('id') id: number) {
    return await this.movieService.findMovieById(id);
  }

  @Post()
  async createMovie(@Body() inputMovieDto: InputMovieDto) {
    return await this.movieService.createMovie(inputMovieDto);
  }

  @Put(':id')
  async updateMovie(
    @Param('id') id: number,
    @Body() inputMovieDto: InputMovieDto,
  ) {
    return await this.movieService.updateMovie(id, inputMovieDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteMovie(@Param('id') id: number) {
    await this.movieService.deleteMovie(id);
  }

  @Get('producers/intervals')
  async getProducers() {
    return await this.movieService.getProducersWithIntervals();
  }
}
