import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Movie } from 'src/movie/movie.entity';
import { Repository } from 'typeorm';

export async function importCsvData(movieRepository: Repository<Movie>) {
  await new Promise<void>((resolve, reject) => {
    const movies = [];
    fs.createReadStream('src/data/movies.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        movies.push(row);
      })
      .on('end', async () => {
        const formattedMovies = movies.map((movie) => ({
          ...movie,
          winner: movie.winner === 'yes',
        }));
        await movieRepository.save(formattedMovies);
        resolve();
      })
      .on('error', reject);
  });
}
