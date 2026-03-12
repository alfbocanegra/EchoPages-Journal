'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.saveEntries = saveEntries;
exports.getEntries = getEntries;
exports.saveEntry = saveEntry;
exports.getEntry = getEntry;
exports.deleteEntry = deleteEntry;
exports.getPendingEntries = getPendingEntries;
exports.getWeatherLocationTaggingEnabled = getWeatherLocationTaggingEnabled;
exports.setWeatherLocationTaggingEnabled = setWeatherLocationTaggingEnabled;
const async_storage_1 = __importDefault(require('@react-native-async-storage/async-storage'));
const SecureKeyStorage_1 = require('./SecureKeyStorage');
const crypto_js_1 = __importDefault(require('crypto-js'));
const STORAGE_KEY = 'journalEntries';
const WEATHER_LOCATION_PREF_KEY = 'weatherLocationTaggingEnabled';
function encrypt(text, key) {
  return crypto_js_1.default.AES.encrypt(text, key).toString();
}
function decrypt(cipher, key) {
  const bytes = crypto_js_1.default.AES.decrypt(cipher, key);
  return bytes.toString(crypto_js_1.default.enc.Utf8);
}
async function saveEntries(entries) {
  const key = await (0, SecureKeyStorage_1.getEncryptionKey)();
  if (!key) throw new Error('Encryption key not available');
  const plain = JSON.stringify(entries);
  const encrypted = encrypt(plain, key);
  await async_storage_1.default.setItem(STORAGE_KEY, encrypted);
}
async function getEntries() {
  const key = await (0, SecureKeyStorage_1.getEncryptionKey)();
  if (!key) throw new Error('Encryption key not available');
  const encrypted = await async_storage_1.default.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = decrypt(encrypted, key);
    return JSON.parse(decrypted);
  } catch (e) {
    return [];
  }
}
async function saveEntry(entry) {
  const entries = await getEntries();
  const idx = entries.findIndex(e => e.id === entry.id);
  const now = new Date().toISOString();
  const entryWithSync = {
    ...entry,
    syncStatus: entry.syncStatus || 'pending',
    updatedAt: now,
  };
  if (idx >= 0) entries[idx] = entryWithSync;
  else entries.push(entryWithSync);
  await saveEntries(entries);
}
async function getEntry(id) {
  const entries = await getEntries();
  return entries.find(e => e.id === id);
}
async function deleteEntry(id) {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.id !== id);
  await saveEntries(filtered);
}
async function getPendingEntries() {
  const entries = await getEntries();
  return entries.filter(e => e.syncStatus === 'pending');
}
async function getWeatherLocationTaggingEnabled() {
  const value = await async_storage_1.default.getItem(WEATHER_LOCATION_PREF_KEY);
  if (value === null) return true; // default to enabled
  return value === 'true';
}
async function setWeatherLocationTaggingEnabled(enabled) {
  await async_storage_1.default.setItem(WEATHER_LOCATION_PREF_KEY, enabled ? 'true' : 'false');
}
//# sourceMappingURL=EncryptedEntryStorage.js.map
