import { echopages } from '../entities/Folder_pb.js';

export function serializeFolder(folder: any): Uint8Array {
  const message = echopages.Folder.create(folder);
  return echopages.Folder.encode(message).finish();
}

export function deserializeFolder(buffer: Uint8Array): any {
  const message = echopages.Folder.decode(buffer);
  return echopages.Folder.toObject(message, { defaults: true });
}
