import { randomBytes } from 'crypto';

export class StringHelper {
  static generateRandomToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static generateNumericCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static truncate(text: string, length: number = 100, suffix: string = '...'): string {
    if (text.length <= length) {
      return text;
    }

    return text.substring(0, length).trim() + suffix;
  }

  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static camelToSnake(text: string): string {
    return text.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  static snakeToCamel(text: string): string {
    return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    const maskedLocal = local.substring(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (phone.length < 4) return phone;
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  }
}
