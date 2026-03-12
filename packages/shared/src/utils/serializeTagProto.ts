import { echopages } from '../entities/Tag_pb.js';

export function serializeTag(tag: any): Uint8Array {
  const message = echopages.Tag.create(tag);
  return echopages.Tag.encode(message).finish();
}

export function deserializeTag(buffer: Uint8Array): any {
  const message = echopages.Tag.decode(buffer);
  return echopages.Tag.toObject(message, { defaults: true });
}
