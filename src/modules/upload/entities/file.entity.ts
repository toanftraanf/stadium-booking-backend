/* eslint-disable prettier/prettier */
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('files')
export class File {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  publicId?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  type?: string; // e.g., 'image', 'video', 'document'

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
