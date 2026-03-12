// AES-GCM encryption/decryption using Web Crypto API
// Key is derived from passphrase using PBKDF2

function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}
function uint8ToStr(buf: Uint8Array) {
  return new TextDecoder().decode(buf);
}
function bufToBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToBuf(b64: string) {
  const bin = atob(b64);
  return new Uint8Array([...bin].map(c => c.charCodeAt(0))).buffer;
}

async function getKey(pass: string, salt: Uint8Array) {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    strToUint8(pass),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plain: string, pass: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(pass, salt);
  const enc = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, strToUint8(plain));
  // Output: base64(salt) + "." + base64(iv) + "." + base64(cipher)
  return `${bufToBase64(salt.buffer)}.${bufToBase64(iv.buffer)}.${bufToBase64(enc)}`;
}

export async function decryptData(cipher: string, pass: string): Promise<string> {
  const [saltB64, ivB64, dataB64] = cipher.split('.');
  const salt = new Uint8Array(base64ToBuf(saltB64));
  const iv = new Uint8Array(base64ToBuf(ivB64));
  const data = base64ToBuf(dataB64);
  const key = await getKey(pass, salt);
  const dec = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return uint8ToStr(new Uint8Array(dec));
}
