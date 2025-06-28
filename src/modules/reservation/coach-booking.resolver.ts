import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoachBookingService } from './coach-booking.service';
import { CoachBooking } from './entities/coach-booking.entity';
import { CreateCoachBookingInput } from './dto/create-coach-booking.input';
import { UpdateCoachBookingInput } from './dto/update-coach-booking.input';

@Resolver(() => CoachBooking)
export class CoachBookingResolver {
  constructor(private readonly coachBookingService: CoachBookingService) {}

  @Mutation(() => CoachBooking)
  createCoachBooking(
    @Args('createCoachBookingInput')
    createCoachBookingInput: CreateCoachBookingInput,
  ) {
    return this.coachBookingService.create(createCoachBookingInput);
  }

  @Query(() => [CoachBooking], { name: 'coachBookings' })
  findAll() {
    return this.coachBookingService.findAll();
  }

  @Query(() => [CoachBooking], { name: 'coachBookingsByCoachProfile' })
  findByCoachProfile(
    @Args('coachProfileId', { type: () => Int }) coachProfileId: number,
  ) {
    return this.coachBookingService.findByCoachProfile(coachProfileId);
  }

  @Query(() => [CoachBooking], { name: 'coachBookingsByClient' })
  findByClient(@Args('clientId', { type: () => Int }) clientId: number) {
    return this.coachBookingService.findByClient(clientId);
  }

  @Query(() => CoachBooking, { name: 'coachBooking' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.coachBookingService.findOne(id);
  }

  @Mutation(() => CoachBooking)
  updateCoachBooking(
    @Args('updateCoachBookingInput')
    updateCoachBookingInput: UpdateCoachBookingInput,
  ) {
    return this.coachBookingService.update(
      updateCoachBookingInput.id,
      updateCoachBookingInput,
    );
  }

  @Mutation(() => CoachBooking)
  removeCoachBooking(@Args('id', { type: () => Int }) id: number) {
    return this.coachBookingService.remove(id);
  }

  @Mutation(() => CoachBooking)
  cancelCoachBooking(@Args('id', { type: () => Int }) id: number) {
    return this.coachBookingService.cancelBooking(id);
  }

  @Mutation(() => CoachBooking)
  confirmCoachBooking(@Args('id', { type: () => Int }) id: number) {
    return this.coachBookingService.confirmBooking(id);
  }
}
