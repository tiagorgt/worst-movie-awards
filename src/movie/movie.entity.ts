import { Producer } from '../producer/producer.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  year: number;

  @ManyToMany(() => Producer, (producer) => producer.movies, { cascade: true })
  @JoinTable()
  producers: Producer[];

  @Column()
  winner: boolean;

  @Column()
  studios: string;
}
