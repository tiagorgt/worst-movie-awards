import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Producer } from './producer.entity';
import { InputProducerDto } from './dto/input-producer.dto';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(
    @InjectRepository(Producer)
    private producerRepository: Repository<Producer>,
  ) {}

  async getProducers() {
    this.logger.log('Getting all producers');
    return this.producerRepository.find();
  }

  async createProducer(inputProducerDto: InputProducerDto) {
    this.logger.log(`Creating producer ${JSON.stringify(inputProducerDto)}`);
    const result = await this.producerRepository.insert(inputProducerDto);
    this.logger.log(`Producer created with id ${result.identifiers[0].id}`);
    return this.findProducerById(result.identifiers[0].id);
  }

  async updateProducer(id: number, inputProducerDto: InputProducerDto) {
    this.logger.log(`Updating producer with id ${id}`);
    const result = await this.producerRepository.update(id, inputProducerDto);

    if (result.affected === 0) {
      const message = `Producer with id ${id} not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Producer updated with id ${id}`);

    return this.findProducerById(id);
  }

  async deleteProducer(id: number) {
    this.logger.log(`Deleting producer with id ${id}`);
    const result = await this.producerRepository.delete(id);

    if (result.affected === 0) {
      const message = `Producer with id ${id} not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Producer deleted with id ${id}`);
  }

  async findProducerById(id: number) {
    this.logger.log(`Finding producer with id ${id}`);

    const result = await this.producerRepository.findOneBy({ id });

    if (!result) {
      const message = `Producer with id ${id} not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Producer found with id ${id}`);

    return result;
  }

  async findProducersByIds(ids: number[]) {
    this.logger.log(`Finding producers with ids ${ids}`);

    const producers = await this.producerRepository.find({
      where: { id: In(ids) },
    });

    if (producers.length !== ids.length) {
      const message = `Some producers not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }

    this.logger.log(`Producers found with ids ${ids}`);

    return producers;
  }
}
