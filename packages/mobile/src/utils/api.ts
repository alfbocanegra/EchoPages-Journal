export async function getConflicts(userId: string, deviceId: string) {
  const res = await fetch(
    `http://localhost:3000/sync/conflicts?userId=${userId}&deviceId=${deviceId}`
  );
  if (!res.ok) throw new Error('Failed to fetch conflicts');
  return res.json();
}

export async function resolveConflict(conflictId: string, resolution: any) {
  const res = await fetch('http://localhost:3000/sync/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conflictId, resolution }),
  });
  if (!res.ok) throw new Error('Failed to resolve conflict');
  return res.json();
}

// Cloud storage API
export async function selectCloudProvider(provider: string) {
  const res = await fetch('http://localhost:3000/cloud/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!res.ok) throw new Error('Failed to select provider');
  return res.json();
}

export async function authenticateCloudProvider() {
  const res = await fetch('http://localhost:3000/cloud/authenticate', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to authenticate provider');
  return res.json();
}

export async function getCloudStatus() {
  const res = await fetch('http://localhost:3000/cloud/status');
  if (!res.ok) throw new Error('Failed to get cloud status');
  return res.json();
}

export async function listCloudFiles() {
  const res = await fetch('http://localhost:3000/cloud/files');
  if (!res.ok) throw new Error('Failed to list cloud files');
  return res.json();
}

export async function uploadCloudFile(file: any, meta: any) {
  // TODO: Implement real upload
  const res = await fetch('http://localhost:3000/cloud/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, meta }),
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
}

export async function downloadCloudFile(fileId: string) {
  const res = await fetch(
    `http://localhost:3000/cloud/download?fileId=${encodeURIComponent(fileId)}`
  );
  if (!res.ok) throw new Error('Failed to download file');
  return res.json();
}

export async function deleteCloudFile(fileId: string) {
  const res = await fetch('http://localhost:3000/cloud/file', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId }),
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return res.json();
}

export async function getCloudQuota() {
  const res = await fetch('http://localhost:3000/cloud/quota');
  if (!res.ok) throw new Error('Failed to get cloud quota');
  return res.json();
}
