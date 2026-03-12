# Security Review Checklist: Authentication & Session Management

## OAuth 2.0
- [x] Use official provider SDKs (Google, Apple, etc.)
- [x] Validate OAuth tokens and user info from providers
- [x] Issue signed JWTs with strong secret
- [ ] Rotate secrets regularly
- [ ] Use HTTPS for all endpoints

## JWT
- [x] Sign JWTs with strong secret
- [x] Set reasonable expiry (7 days)
- [ ] Store JWT in secure, httpOnly cookie (TODO: implement)
- [ ] Support refresh tokens for long-lived sessions (TODO: implement)
- [ ] Invalidate JWT on logout/session expiry

## Biometric Authentication
- [x] Web: Simulated (TODO: implement WebAuthn for production)
- [ ] Mobile: Use platform APIs (Keychain, KeyStore, etc.)
- [ ] Desktop: Use OS APIs (Windows Hello, Touch ID, etc.)
- [ ] Never transmit/store biometric data outside secure enclave
- [ ] Implement liveness detection where available

## Passwordless Fallback (Magic Link/SMS)
- [x] Simulated in web UI
- [ ] Backend: Implement real email/SMS delivery
- [ ] Use one-time, short-lived codes/links
- [ ] Rate-limit requests to prevent abuse

## Session Management
- [x] JWT expiry and auto-logout in frontend
- [ ] Invalidate JWT on backend after logout (TODO: implement blacklist or short expiry)
- [ ] Notify user on session expiry

## Penetration Testing & Compliance
- [ ] Run automated security scans (OWASP ZAP, etc.)
- [ ] Manual penetration testing (OAuth, JWT, fallback flows)
- [ ] Review for GDPR/CCPA compliance
- [ ] Document all security measures and known limitations

---

**TODO:**
- Complete all unchecked items before production launch
- Document any third-party audits or external reviews 