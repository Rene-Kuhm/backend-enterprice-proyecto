import { addDays, addHours, addMinutes, format } from 'date-fns';

export class DateHelper {
  static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  static addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  }

  static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  static format(date: Date, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string {
    return format(date, formatString);
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  static getExpiryDate(minutes: number): Date {
    return this.addMinutes(new Date(), minutes);
  }

  static getExpiryDateFromHours(hours: number): Date {
    return this.addHours(new Date(), hours);
  }

  static getExpiryDateFromDays(days: number): Date {
    return this.addDays(new Date(), days);
  }

  static parseJwtExpiration(expirationString: string): Date {
    const match = expirationString.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const now = new Date();

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return this.addMinutes(now, value);
      case 'h':
        return this.addHours(now, value);
      case 'd':
        return this.addDays(now, value);
      default:
        throw new Error('Invalid time unit');
    }
  }
}
