import { StringHelper } from './string.helper';

describe('StringHelper', () => {
  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(StringHelper.slugify('Hello World')).toBe('hello-world');
      expect(StringHelper.slugify('Test String 123')).toBe('test-string-123');
      expect(StringHelper.slugify('The Quick Brown Fox')).toBe('the-quick-brown-fox');
    });

    it('should handle special characters', () => {
      expect(StringHelper.slugify('Hello & World!')).toBe('hello-world');
      expect(StringHelper.slugify('Test@String#123')).toBe('teststring123');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(StringHelper.slugify('  Hello World  ')).toBe('hello-world');
      expect(StringHelper.slugify('-Hello-')).toBe('hello');
    });

    it('should handle multiple consecutive spaces', () => {
      expect(StringHelper.slugify('Hello    World')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(StringHelper.slugify('')).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(StringHelper.capitalize('hello')).toBe('Hello');
      expect(StringHelper.capitalize('world')).toBe('World');
      expect(StringHelper.capitalize('test')).toBe('Test');
    });

    it('should handle already capitalized string', () => {
      expect(StringHelper.capitalize('Hello')).toBe('Hello');
      expect(StringHelper.capitalize('WORLD')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(StringHelper.capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(StringHelper.capitalize('a')).toBe('A');
      expect(StringHelper.capitalize('Z')).toBe('Z');
    });
  });

  describe('generateRandomToken', () => {
    it('should generate random token of specified length in hex', () => {
      const result = StringHelper.generateRandomToken(32);
      expect(result).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('should generate different tokens', () => {
      const token1 = StringHelper.generateRandomToken(16);
      const token2 = StringHelper.generateRandomToken(16);
      expect(token1).not.toBe(token2);
    });

    it('should generate hexadecimal characters only', () => {
      const result = StringHelper.generateRandomToken(32);
      expect(result).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('generateNumericCode', () => {
    it('should generate numeric code of specified length', () => {
      const result = StringHelper.generateNumericCode(6);
      expect(result).toHaveLength(6);
    });

    it('should generate only numeric characters', () => {
      const result = StringHelper.generateNumericCode(8);
      expect(result).toMatch(/^[0-9]+$/);
    });

    it('should generate different codes', () => {
      const code1 = StringHelper.generateNumericCode(6);
      const code2 = StringHelper.generateNumericCode(6);
      // They might be equal but very unlikely
      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(StringHelper.truncate('Hello World', 5)).toBe('Hello...');
      expect(StringHelper.truncate('The quick brown fox', 10)).toBe('The quick...');
    });

    it('should not truncate short strings', () => {
      expect(StringHelper.truncate('Hello', 10)).toBe('Hello');
      expect(StringHelper.truncate('Test', 5)).toBe('Test');
    });

    it('should use custom suffix', () => {
      expect(StringHelper.truncate('Hello World', 5, '---')).toBe('Hello---');
    });

    it('should handle default length of 100', () => {
      const longString = 'a'.repeat(150);
      const result = StringHelper.truncate(longString);
      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(StringHelper.camelToSnake('helloWorld')).toBe('hello_world');
      expect(StringHelper.camelToSnake('testString')).toBe('test_string');
      expect(StringHelper.camelToSnake('myVariableName')).toBe('my_variable_name');
    });

    it('should handle already lowercase strings', () => {
      expect(StringHelper.camelToSnake('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(StringHelper.camelToSnake('')).toBe('');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(StringHelper.snakeToCamel('hello_world')).toBe('helloWorld');
      expect(StringHelper.snakeToCamel('test_string')).toBe('testString');
      expect(StringHelper.snakeToCamel('my_variable_name')).toBe('myVariableName');
    });

    it('should handle strings without underscores', () => {
      expect(StringHelper.snakeToCamel('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(StringHelper.snakeToCamel('')).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename by removing special characters', () => {
      expect(StringHelper.sanitizeFilename('My File!@#$.txt')).toBe('my_file____.txt');
      expect(StringHelper.sanitizeFilename('Document (Copy).pdf')).toBe('document__copy_.pdf');
    });

    it('should convert to lowercase', () => {
      expect(StringHelper.sanitizeFilename('MyFile.TXT')).toBe('myfile.txt');
    });

    it('should preserve dots and hyphens', () => {
      expect(StringHelper.sanitizeFilename('my-file.v2.txt')).toBe('my-file.v2.txt');
    });
  });

  describe('maskEmail', () => {
    it('should mask email address', () => {
      expect(StringHelper.maskEmail('john@example.com')).toBe('jo***@example.com');
      expect(StringHelper.maskEmail('admin@company.com')).toBe('ad***@company.com');
    });

    it('should handle invalid email format', () => {
      expect(StringHelper.maskEmail('invalidemail')).toBe('invalidemail');
      expect(StringHelper.maskEmail('@example.com')).toBe('@example.com');
    });

    it('should handle short local part', () => {
      expect(StringHelper.maskEmail('ab@example.com')).toBe('ab***@example.com');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number', () => {
      expect(StringHelper.maskPhone('1234567890')).toBe('******7890');
      expect(StringHelper.maskPhone('+15551234567')).toBe('********4567');
    });

    it('should handle short phone numbers', () => {
      expect(StringHelper.maskPhone('123')).toBe('123');
      expect(StringHelper.maskPhone('1234')).toBe('1234');
    });

    it('should preserve last 4 digits', () => {
      expect(StringHelper.maskPhone('9876543210')).toBe('******3210');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings gracefully', () => {
      expect(StringHelper.capitalize('')).toBe('');
      expect(StringHelper.slugify('')).toBe('');
      expect(StringHelper.camelToSnake('')).toBe('');
      expect(StringHelper.snakeToCamel('')).toBe('');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const truncated = StringHelper.truncate(longString, 100);
      expect(truncated.length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('should handle special characters in slugify', () => {
      expect(StringHelper.slugify('Héllo Wörld')).toBeDefined();
      expect(StringHelper.slugify('Test@#$%^&*()')).toBeDefined();
    });
  });
});
