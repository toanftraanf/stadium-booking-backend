import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { NotFoundException } from '@nestjs/common';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { BookingErrorCode } from './enums/booking-error-code.enum';
import { BookingConflictException } from './exceptions/booking-conflict.exception';
import { StadiumNotFoundException } from './exceptions/stadium-not-found.exception';
import { InvalidTimeSlotException } from './exceptions/invalid-time-slot.exception';

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(private readonly reservationService: ReservationService) {}

  private handleError(error: any): never {
    if (error instanceof BookingConflictException) {
      throw new GraphQLError('The selected time slot is already booked', {
        extensions: { code: BookingErrorCode.BOOKING_CONFLICT },
      });
    }

    if (error instanceof StadiumNotFoundException) {
      throw new GraphQLError('Stadium not found', {
        extensions: { code: BookingErrorCode.STADIUM_NOT_FOUND },
      });
    }

    if (error instanceof InvalidTimeSlotException) {
      throw new GraphQLError('Invalid time slot provided', {
        extensions: { code: BookingErrorCode.INVALID_TIME_SLOT },
      });
    }

    if (error instanceof NotFoundException) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Handle string-based error checking for backward compatibility
    if (error.message) {
      if (error.message.includes('BOOKING_CONFLICT')) {
        throw new GraphQLError('The selected time slot is already booked', {
          extensions: { code: BookingErrorCode.BOOKING_CONFLICT },
        });
      }

      if (error.message.includes('STADIUM_NOT_FOUND')) {
        throw new GraphQLError('Stadium not found', {
          extensions: { code: BookingErrorCode.STADIUM_NOT_FOUND },
        });
      }

      if (error.message.includes('INVALID_TIME_SLOT')) {
        throw new GraphQLError('Invalid time slot provided', {
          extensions: { code: BookingErrorCode.INVALID_TIME_SLOT },
        });
      }
    }

    // Re-throw other errors as GraphQL errors
    throw new GraphQLError(error.message || 'An unexpected error occurred', {
      extensions: {
        code: 'INTERNAL_ERROR',
        originalError: error.name || 'Unknown',
      },
    });
  }

  @Mutation(() => Reservation)
  async createReservation(
    @Args('createReservationInput')
    createReservationInput: CreateReservationInput,
  ) {
    try {
      const reservation = await this.reservationService.create(
        createReservationInput,
      );
      return reservation;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => [Reservation], { name: 'reservations' })
  findAll() {
    return this.reservationService.findAll();
  }

  @Query(() => Reservation, { name: 'reservation' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reservationService.findOne(id);
  }

  @Query(() => [Reservation], { name: 'reservationsByUser' })
  findByUserId(@Args('userId', { type: () => Int }) userId: number) {
    return this.reservationService.findByUserId(userId);
  }

  @Query(() => [Reservation], { name: 'userReservations' })
  userReservations(@Args('userId', { type: () => Int }) userId: number) {
    return this.reservationService.findByUserId(userId);
  }

  @Query(() => [Reservation], { name: 'reservationsByStadium' })
  findByStadiumId(@Args('stadiumId', { type: () => Int }) stadiumId: number) {
    return this.reservationService.findByStadiumId(stadiumId);
  }

  @Query(() => [Reservation], { name: 'stadiumReservations' })
  findStadiumReservations(
    @Args('stadiumId', { type: () => Int }) stadiumId: number,
    @Args('date') date: string,
  ) {
    return this.reservationService.findStadiumReservations(stadiumId, date);
  }

  @Query(() => [Reservation], { name: 'ownerStadiumReservationsByDateRange' })
  ownerStadiumReservationsByDateRange(
    @Args('ownerId', { type: () => Int }) ownerId: number,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return this.reservationService.findOwnerStadiumReservationsByDateRange(
      ownerId,
      startDate,
      endDate,
    );
  }

  @Mutation(() => Reservation)
  async updateReservation(
    @Args('updateReservationInput')
    updateReservationInput: UpdateReservationInput,
  ) {
    try {
      return await this.reservationService.update(
        updateReservationInput.id,
        updateReservationInput,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Mutation(() => Reservation)
  async updateReservationStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status') status: string,
  ) {
    try {
      return await this.reservationService.updateStatus(id, status);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Mutation(() => Reservation)
  async removeReservation(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.reservationService.remove(id);
    } catch (error) {
      this.handleError(error);
    }
  }
}
