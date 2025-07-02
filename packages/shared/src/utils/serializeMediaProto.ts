import { echopages } from '../entities/Media_pb.js';

export function serializeMedia(media: any): Uint8Array {
  const message = echopages.Media.create(media);
  return echopages.Media.encode(message).finish();
}

export function deserializeMedia(buffer: Uint8Array): any {
  const message = echopages.Media.decode(buffer);
  return echopages.Media.toObject(message, { defaults: true });
}
