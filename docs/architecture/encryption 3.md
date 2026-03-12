# Field Encryption System

The EchoPages Journal implements a robust field-level encryption system to protect sensitive user data both at rest and during synchronization. This document outlines the encryption architecture, implementation details, security considerations, and best practices.

## Overview

The encryption system is designed to:
- Protect sensitive journal content and media attachments
- Support both server-side (PostgreSQL) and local (SQLite) storage
- Enable secure cross-device synchronization
- Maintain query performance on non-encrypted fields
- Allow for future key rotation

## Architecture

### Key Management

1. **Master Key Derivation**
   - Each user has a unique master key derived from their password using Argon2id
   - Master keys are never stored, only derived when needed
   - Key derivation parameters:
     - Memory: 64MB
     - Iterations: 3
     - Parallelism: 4
     - Salt: Unique per user, stored in database
     - Output length: 32 bytes

2. **Content Encryption Keys (CEK)**
   - Unique per encrypted field
   - Generated using CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
   - Encrypted with user's master key using AES-256-GCM
   - Stored alongside encrypted content

### Encryption Algorithm

- **Primary Algorithm**: AES-256-GCM
  - 256-bit key length
  - GCM mode for authenticated encryption
  - 96-bit random nonce (stored as base64 string)
  - 128-bit authentication tag (stored as base64 string)
  - All encrypted field metadata (`encryptedData`, `key`, `nonce`, `tag`) is stored as base64 strings for portability and database compatibility.

### Database Schema Integration

1. **Encrypted Fields**
   - Journal entries:
     - `content` (when `content_encrypted = true`)
   - Folders:
     - All content when `is_encrypted = true`
   - Media attachments:
     - File content when `is_encrypted = true`

2. **Encryption Metadata**
   - Each encrypted field stores:
     - Encrypted content
     - Encrypted CEK
     - Nonce
     - Authentication tag

## Implementation Details

### Encryption Process

1. **Content Encryption**
   ```typescript
   // Generate random CEK
   const cek = crypto.randomBytes(32);
   
   // Generate random nonce
   const nonce = crypto.randomBytes(12);
   
   // Encrypt content
   const cipher = crypto.createCipheriv('aes-256-gcm', cek, nonce);
   const encryptedContent = Buffer.concat([
     cipher.update(content),
     cipher.final()
   ]);
   const authTag = cipher.getAuthTag();
   
   // Store as base64 strings
   const encryptedData = {
     encryptedData: encryptedContent.toString('base64'),
     key: cek.toString('base64'),
     nonce: nonce.toString('base64'),
     tag: authTag.toString('base64'),
   };
   ```

2. **Decryption Process**
   ```typescript
   // Decrypt CEK
   const cek = decryptCEK(wrappedKey, masterKey);
   
   // Decrypt content
   const decipher = crypto.createDecipheriv('aes-256-gcm', cek, nonce);
   decipher.setAuthTag(authTag);
   const decryptedContent = Buffer.concat([
     decipher.update(encryptedContent),
     decipher.final()
   ]);
   ```

### Performance Considerations

1. **Query Performance**
   - Non-encrypted fields remain queryable
   - Encrypted fields require client-side filtering
   - Indexes maintained on encryption status flags

2. **Caching Strategy**
   - Decrypted content cached in memory (Redis)
   - Cache entries expire after 15 minutes
   - Cache cleared on user logout

### Security Measures

1. **Memory Management**
   - Keys zeroed in memory after use
   - Secure memory wiping for sensitive data
   - No sensitive data logged or stored in temp files

2. **Error Handling**
   - Failed decryption attempts logged
   - Rate limiting on key derivation
   - Secure error messages (no data leakage)

## Limitations and Considerations

1. **Search Limitations**
   - Full-text search not available on encrypted content
   - Client must download and decrypt for content search
   - Consider implementing secure search index in future

2. **Performance Impact**
   - Key derivation adds ~100ms to login
   - Encryption/decryption adds ~5ms per operation
   - Increased storage space (~10% overhead)

3. **Sync Considerations**
   - Encrypted content requires full sync
   - No delta updates on encrypted fields
   - Increased bandwidth usage

## Future Improvements

1. **Planned Enhancements**
   - Key rotation mechanism
   - Searchable encryption
   - Hardware security module (HSM) support
   - Quantum-resistant algorithms

2. **Monitoring and Audit**
   - Encryption operation metrics
   - Key usage tracking
   - Failed operation alerting

## Security Recommendations

1. **Password Requirements**
   - Minimum 12 characters
   - Mix of character types
   - No common patterns
   - Regular rotation encouraged

2. **Application Security**
   - Keep app updated
   - Enable device encryption
   - Use secure lock screen
   - Regular security audits

## Emergency Procedures

1. **Key Compromise**
   - Immediate password change
   - Key rotation
   - Security audit
   - User notification

2. **Data Recovery**
   - Backup key storage
   - Recovery procedures
   - Technical support contact

## References

1. **Standards**
   - NIST SP 800-38D (GCM)
   - NIST SP 800-132 (Key Derivation)
   - RFC 5116 (AEAD)

2. **Libraries**
   - Node.js Crypto
   - Argon2
   - SQLCipher (SQLite)

## Migration System

A dedicated migration system is provided to encrypt existing data in the database, updating all relevant fields and storing the required encryption metadata (`encryptedData`, `key`, `nonce`, `tag`).

**After running migrations or making changes to encryption logic, always run the test suite to ensure correctness and security.** 