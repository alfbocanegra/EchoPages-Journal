import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Folder } from './Folder';
import { Tag } from './Tag';
import { Media } from './Media';
import { EntryVersion } from './EntryVersion';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'folder_id', nullable: true })
  folderId?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_type', default: 'text' })
  contentType: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ name: 'encryption_iv', nullable: true })
  encryptionIv?: string;

  @Column({ nullable: true })
  mood?: string;

  @Column({ type: 'json', nullable: true })
  weather?: {
    temperature?: number;
    condition?: string;
    location?: string;
  };

  @Column({ type: 'json', nullable: true })
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };

  @Column({ name: 'is_favorite', default: false })
  isFavorite: boolean;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'local_id', nullable: true })
  localId?: string;

  @Column({ name: 'sync_status', default: 'synced' })
  syncStatus: 'synced' | 'pending' | 'conflict';

  @Column({ name: 'last_sync_at', type: 'timestamp with time zone', nullable: true })
  lastSyncAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.entries)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Folder, folder => folder.entries)
  @JoinColumn({ name: 'folder_id' })
  folder?: Folder;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'entry_tags',
    joinColumn: { name: 'entry_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => Media, media => media.entry)
  media: Media[];

  @OneToMany(() => EntryVersion, version => version.entry)
  versions: EntryVersion[];
}
