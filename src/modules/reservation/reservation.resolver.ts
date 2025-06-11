import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(private readonly reservationService: ReservationService) {}

  @Mutation(() => Reservation)
  createReservation(
    @Args('createReservationInput')
    createReservationInput: CreateReservationInput,
  ) {
    return this.reservationService.create(createReservationInput);
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
  updateReservation(
    @Args('updateReservationInput')
    updateReservationInput: UpdateReservationInput,
  ) {
    return this.reservationService.update(
      updateReservationInput.id,
      updateReservationInput,
    );
  }

  @Mutation(() => Reservation)
  updateReservationStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status') status: string,
  ) {
    return this.reservationService.updateStatus(id, status);
  }

  @Mutation(() => Reservation)
  removeReservation(@Args('id', { type: () => Int }) id: number) {
    return this.reservationService.remove(id);
  }
}
