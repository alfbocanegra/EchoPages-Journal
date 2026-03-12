import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class TOTPService {
  static generateSecret(userId: string) {
    return speakeasy.generateSecret({
      name: `EchoPages (${userId})`,
      length: 20,
    });
  }

  static verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  static async getQRCodeDataURL(otpauthUrl: string) {
    return await qrcode.toDataURL(otpauthUrl);
  }
}
