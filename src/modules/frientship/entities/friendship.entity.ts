import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('friendships')
@Unique('UQ_friendship_pair', ['userOne', 'userTwo'])
export class Friendship {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => User, (u) => u.friendshipsInitiated, { onDelete: 'CASCADE' })
  userOne: User;

  @ManyToOne(() => User, (u) => u.friendshipsReceived, { onDelete: 'CASCADE' })
  userTwo: User;

  @CreateDateColumn()
  createdAt: Date;
}
