import { echopages } from '../entities/Entry_pb.js';

export function serializeEntry(entry: any): Uint8Array {
  const message = echopages.Entry.create(entry);
  return echopages.Entry.encode(message).finish();
}

export function deserializeEntry(buffer: Uint8Array): any {
  const message = echopages.Entry.decode(buffer);
  return echopages.Entry.toObject(message, { defaults: true });
}
