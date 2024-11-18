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
import { ProducerService } from './producer.service';
import { InputProducerDto } from './dto/input-producer.dto';

@Controller('producers')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  async getProducers() {
    return await this.producerService.getProducers();
  }

  @Get(':id')
  async getProducer(@Param('id') id: number) {
    return await this.producerService.findProducerById(id);
  }

  @Post()
  async createProducer(@Body() inputProducerDto: InputProducerDto) {
    return await this.producerService.createProducer(inputProducerDto);
  }

  @Put(':id')
  async updateProducer(
    @Param('id') id: number,
    @Body() inputProducerDto: InputProducerDto,
  ) {
    return await this.producerService.updateProducer(id, inputProducerDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteProducer(@Param('id') id: number) {
    await this.producerService.deleteProducer(id);
  }
}
