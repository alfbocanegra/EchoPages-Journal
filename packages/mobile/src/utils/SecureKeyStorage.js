'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateEncryptionKey = generateEncryptionKey;
exports.storeEncryptionKey = storeEncryptionKey;
exports.getEncryptionKey = getEncryptionKey;
exports.deleteEncryptionKey = deleteEncryptionKey;
// @ts-ignore: No type declarations for react-native-keychain
const Keychain = __importStar(require('react-native-keychain'));
const crypto_1 = require('crypto');
const SERVICE = 'EchoPagesEncryptionKey';
const KEY_LENGTH = 32; // 256 bits
async function generateEncryptionKey() {
  // Generate a random 256-bit key (base64)
  return (0, crypto_1.randomBytes)(KEY_LENGTH).toString('base64');
}
async function storeEncryptionKey(key) {
  await Keychain.setGenericPassword('encryption', key, { service: SERVICE });
}
async function getEncryptionKey() {
  const creds = await Keychain.getGenericPassword({ service: SERVICE });
  return creds ? creds.password : null;
}
async function deleteEncryptionKey() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
// Usage example (call after successful login):
// let key = await getEncryptionKey();
// if (!key) {
//   key = await generateEncryptionKey();
//   await storeEncryptionKey(key);
// }
// Use `key` for all local encryption/decryption
//# sourceMappingURL=SecureKeyStorage.js.map
