import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(
        `${metadata.data || 'Value'} must be a valid UUID`,
      );
    }

    return value;
  }
}
