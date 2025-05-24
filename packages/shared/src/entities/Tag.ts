import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { Entry } from './Entry';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ default: '#000000' })
  color: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.tags)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Entry)
  @JoinTable({
    name: 'entry_tags',
    joinColumn: { name: 'tag_id' },
    inverseJoinColumn: { name: 'entry_id' },
  })
  entries: Entry[];
}
