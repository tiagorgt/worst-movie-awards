import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';
import { Producer } from './producer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producer])],
  providers: [ProducerService],
  controllers: [ProducerController],
  exports: [ProducerService],
})
export class ProducerModule {}
