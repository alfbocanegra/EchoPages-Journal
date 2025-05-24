import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Entry } from './Entry';

@Entity('entry_versions')
export class EntryVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entry_id' })
  entryId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_type', default: 'text' })
  contentType: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ name: 'encryption_iv', nullable: true })
  encryptionIv?: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column({ name: 'created_by_device', nullable: true })
  createdByDevice?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Entry, entry => entry.versions)
  @JoinColumn({ name: 'entry_id' })
  entry: Entry;
}
