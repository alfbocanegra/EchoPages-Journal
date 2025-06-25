// EncryptedSQLite.ts
// Utility for encrypted SQLite database access using SQLCipher in React Native
// Requires native setup: see instructions below

import SQLite from 'react-native-sqlite-storage';
import { getEncryptionKey, storeEncryptionKey, generateEncryptionKey } from './SecureKeyStorage';

// --- Native Setup Instructions ---
// 1. Install SQLCipher-enabled SQLite library:
//    yarn add react-native-sqlite-storage
// 2. Link native modules (if not autolinked):
//    npx pod-install
// 3. For iOS: Ensure SQLCipher is enabled in Podfile (see react-native-sqlite-storage docs)
// 4. For Android: No extra steps if using the latest library version
// 5. Rebuild the app after installation
// 6. See: https://github.com/andpor/react-native-sqlite-storage#encryption

/**
 * Opens an encrypted SQLite database using the device's secure key from SecureKeyStorage.
 * The key is never stored in plaintext and is retrieved from Keychain/Keystore at runtime.
 */
export async function openEncryptedDatabase(name = 'echopages.db') {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  return new Promise<SQLite.SQLiteDatabase>((resolve, reject) => {
    const db = SQLite.openDatabase(
      {
        name,
        location: 'default',
        key, // SQLCipher key
      },
      () => resolve(db),
      err => reject(err)
    );
  });
}

/**
 * Closes the given SQLite database.
 */
export async function closeDatabase(db: SQLite.SQLiteDatabase) {
  return new Promise<void>((resolve, reject) => {
    db.close(resolve, reject);
  });
}

/**
 * Runs a SQL query on the given database.
 */
export async function runQuery(
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result.rows.raw()),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/**
 * Rekeys the database (changes the encryption key) using SQLCipher's PRAGMA rekey.
 * This should be called if the user changes their device key (e.g., after account recovery or key rotation).
 *
 * Best practice: Always use a strong, random key from SecureKeyStorage. Never store the key in plaintext.
 */
export async function rekeyDatabase(db: SQLite.SQLiteDatabase, newKey: string): Promise<void> {
  await runQuery(db, `PRAGMA rekey = '${newKey}';`);
}

/**
 * Rotates the database encryption key: generates a new key, rekeys the database, and updates the key in SecureKeyStorage.
 * Returns the new key if successful.
 */
export async function rotateDatabaseKey(db: SQLite.SQLiteDatabase): Promise<string> {
  // 1. Generate a new strong key
  const newKey = await generateEncryptionKey();
  // 2. Rekey the database
  await rekeyDatabase(db, newKey);
  // 3. Store the new key securely
  await storeEncryptionKey(newKey);
  return newKey;
}

/**
 * Attaches another encrypted SQLite database to the current connection using its own encryption key.
 * @param db - The main database connection
 * @param dbPath - The file path of the database to attach
 * @param key - The encryption key for the attached database
 * @param alias - The alias to use for the attached database (e.g., 'secondary')
 */
export async function attachEncryptedDatabase(
  db: SQLite.SQLiteDatabase,
  dbPath: string,
  key: string,
  alias: string
): Promise<void> {
  // ATTACH with key for SQLCipher
  await runQuery(db, `ATTACH DATABASE '${dbPath}' AS ${alias} KEY '${key}';`);
}

/**
 * Detaches an attached database from the current connection.
 * @param db - The main database connection
 * @param alias - The alias used for the attached database
 */
export async function detachDatabase(db: SQLite.SQLiteDatabase, alias: string): Promise<void> {
  await runQuery(db, `DETACH DATABASE ${alias};`);
}

/**
 * Performance test: Measures SQLCipher read/write speed for large datasets.
 * Inserts and reads a configurable number of rows, timing the operations.
 * Logs results to the console.
 * @param db - The encrypted database connection
 * @param numRows - Number of rows to insert/read (default: 10000)
 */
export async function testSQLCipherPerformance(
  db: SQLite.SQLiteDatabase,
  numRows: number = 10000
): Promise<void> {
  console.log(`[SQLCipher Perf] Starting performance test with ${numRows} rows...`);
  await runQuery(db, 'DROP TABLE IF EXISTS perf_test');
  await runQuery(db, 'CREATE TABLE perf_test (id INTEGER PRIMARY KEY, data TEXT)');

  // Insert rows
  const insertStart = Date.now();
  for (let i = 0; i < numRows; i++) {
    await runQuery(db, 'INSERT INTO perf_test (data) VALUES (?)', [`row_${i}`]);
  }
  const insertEnd = Date.now();
  console.log(`[SQLCipher Perf] Inserted ${numRows} rows in ${(insertEnd - insertStart) / 1000}s`);

  // Read rows
  const readStart = Date.now();
  const rows = await runQuery(db, 'SELECT * FROM perf_test');
  const readEnd = Date.now();
  console.log(`[SQLCipher Perf] Read ${rows.length} rows in ${(readEnd - readStart) / 1000}s`);

  // Cleanup
  await runQuery(db, 'DROP TABLE perf_test');
  console.log('[SQLCipher Perf] Performance test complete.');
}

/**
 * Configures SQLCipher PBKDF2 key derivation settings for the current database connection.
 * @param db - The encrypted database connection
 * @param iterations - Number of PBKDF2 iterations (default: 64000, recommended: 64000+)
 * Call this immediately after opening the database and before any sensitive operations.
 */
export async function setPBKDF2Iterations(
  db: SQLite.SQLiteDatabase,
  iterations: number = 64000
): Promise<void> {
  await runQuery(db, `PRAGMA kdf_iter = ${iterations};`);
}

// Example usage:
// const db = await openEncryptedDatabase();
// await setPBKDF2Iterations(db, 128000); // Increase for higher security, decrease for faster performance (not recommended)
// await runQuery(db, 'CREATE TABLE IF NOT EXISTS ...');
// await rotateDatabaseKey(db);
// await attachEncryptedDatabase(db, '/path/to/other.db', otherKey, 'secondary');
// ... run queries on secondary ...
// await detachDatabase(db, 'secondary');
// await testSQLCipherPerformance(db, 5000);
// await closeDatabase(db);
