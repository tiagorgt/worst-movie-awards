import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Movie } from '../movie/movie.entity';
import { Repository } from 'typeorm';
import { Producer } from '../producer/producer.entity';

export async function importCsvData(
  movieRepository: Repository<Movie>,
  producerRepository: Repository<Producer>,
) {
  await new Promise<void>((resolve, reject) => {
    const movies = [];
    fs.createReadStream('src/data/movies.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        movies.push(row);
      })
      .on('end', async () => {
        const uniqueProducers = new Set<string>();
        movies.forEach((movie) => {
          movie.producers.split(/,| and /).forEach((producer) => {
            if (producer) uniqueProducers.add(producer.trim());
          });
        });

        const producersToCreate: Producer[] = Array.from(uniqueProducers).map(
          (producer) => {
            return producerRepository.create({ name: producer });
          },
        );
        await producerRepository.save(producersToCreate);

        const formattedMovies = movies.map((movie) => {
          const { title, year, studios, winner, producers } = movie;

          const formattedProducers = producers
            .split(/,| and /)
            .filter((producer) => producer)
            .map((p) => {
              return producersToCreate.find(
                (producer) => producer.name === p.trim(),
              );
            });

          return {
            title,
            year: parseInt(year),
            studios,
            winner: winner === 'yes',
            producers: formattedProducers,
          };
        });
        await movieRepository.save(formattedMovies);
        resolve();
      })
      .on('error', reject);
  });
}
