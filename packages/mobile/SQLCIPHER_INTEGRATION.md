# SQLCipher Integration Guide for EchoPages Journal

This document details the integration of SQLCipher for encrypted local storage in the EchoPages Journal mobile app.

## 1. Native Setup

- **Install SQLCipher-enabled SQLite library:**
  ```sh
  yarn add react-native-sqlite-storage
  npx pod-install
  ```
- **iOS:** Ensure SQLCipher is enabled in your Podfile (see [react-native-sqlite-storage docs](https://github.com/andpor/react-native-sqlite-storage#encryption)).
- **Android:** No extra steps if using the latest library version.
- **Rebuild the app after installation.**

## 2. Key Management

- **Key Generation:**
  - Use a strong, random key generated and stored securely via platform APIs (Keychain for iOS, KeyStore for Android).
  - The key is never stored in plaintext or bundled with the app.
- **Key Storage:**
  - Use the `SecureKeyStorage` utility for all key operations.
- **Key Rotation:**
  - Use the `rotateDatabaseKey` helper to generate a new key, rekey the database, and update secure storage.

## 3. Database Encryption

- **Opening an Encrypted Database:**
  ```ts
  import { openEncryptedDatabase } from './src/utils/EncryptedSQLite';
  const db = await openEncryptedDatabase();
  ```
- **All data and metadata are encrypted at rest.**

## 4. Rekeying (Key Rotation)

- **Rotate the encryption key:**
  ```ts
  import { rotateDatabaseKey } from './src/utils/EncryptedSQLite';
  await rotateDatabaseKey(db);
  ```
- **Best Practice:** Always rotate keys after account recovery or device compromise.

## 5. Multi-Database Support

- **Attach another encrypted database:**
  ```ts
  import { attachEncryptedDatabase, detachDatabase } from './src/utils/EncryptedSQLite';
  await attachEncryptedDatabase(db, '/path/to/other.db', otherKey, 'secondary');
  // ... run queries on secondary ...
  await detachDatabase(db, 'secondary');
  ```
- **Each attached database can have its own encryption key.**

## 6. Usage Patterns

- **Run queries:**
  ```ts
  import { runQuery } from './src/utils/EncryptedSQLite';
  await runQuery(db, 'SELECT * FROM entries');
  ```
- **Close database:**
  ```ts
  import { closeDatabase } from './src/utils/EncryptedSQLite';
  await closeDatabase(db);
  ```

## 7. Best Practices

- Never store encryption keys in plaintext.
- Always use device-bound keys from secure storage.
- Rotate keys periodically and after any security event.
- Test database integrity after rekeying.
- Use strong, random keys (32 bytes for AES-256).

## 8. Troubleshooting

- **Database fails to open:**
  - Ensure the correct key is used.
  - Check native setup and rebuild the app.
- **Rekey operation fails:**
  - Verify the database is not in use by other processes.
  - Ensure the new key is stored before closing the database.
- **Performance issues:**
  - Optimize PBKDF2 settings if needed (see SQLCipher docs).

---
For further details, see the code in `src/utils/EncryptedSQLite.ts` and `src/utils/SecureKeyStorage.ts`. 