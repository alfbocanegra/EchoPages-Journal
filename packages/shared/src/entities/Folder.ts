import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Entry } from './Entry';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.folders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Folder, folder => folder.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Folder;

  @OneToMany(() => Folder, folder => folder.parent)
  children: Folder[];

  @OneToMany(() => Entry, entry => entry.folder)
  entries: Entry[];
}
