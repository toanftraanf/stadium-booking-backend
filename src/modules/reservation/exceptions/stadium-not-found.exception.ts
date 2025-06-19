import { NotFoundException } from '@nestjs/common';
import { BookingErrorCode } from '../enums/booking-error-code.enum';

export class StadiumNotFoundException extends NotFoundException {
  public readonly errorCode = BookingErrorCode.STADIUM_NOT_FOUND;

  constructor(message?: string) {
    super(message || 'Stadium not found');
  }
}
