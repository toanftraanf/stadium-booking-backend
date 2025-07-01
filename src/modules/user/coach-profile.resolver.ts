import {
  Args,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CoachProfileService } from './coach-profile.service';
import { CoachProfile } from './entities/coach-profile.entity';
import { CreateCoachProfileInput } from './dto/create-coach-profile.input';
import { UpdateCoachProfileInput } from './dto/update-coach-profile.input';
import { User } from './entities/user.entity';

@Resolver(() => CoachProfile)
export class CoachProfileResolver {
  constructor(private readonly coachProfileService: CoachProfileService) {}

  @Mutation(() => CoachProfile)
  createCoachProfile(
    @Args('createCoachProfileInput')
    createCoachProfileInput: CreateCoachProfileInput,
  ) {
    return this.coachProfileService.create(createCoachProfileInput);
  }

  @Query(() => [CoachProfile], { name: 'coachProfiles' })
  findAll() {
    return this.coachProfileService.findAll();
  }

  @Query(() => [CoachProfile], { name: 'availableCoachProfiles' })
  findAvailableCoaches() {
    return this.coachProfileService.findAvailableCoaches();
  }

  @Query(() => CoachProfile, { name: 'coachProfile' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.coachProfileService.findOne(id);
  }

  @Query(() => CoachProfile, { name: 'coachProfileByUserId', nullable: true })
  findByUserId(@Args('userId', { type: () => Int }) userId: number) {
    return this.coachProfileService.findByUserId(userId);
  }

  @Mutation(() => CoachProfile)
  updateCoachProfile(
    @Args('updateCoachProfileInput')
    updateCoachProfileInput: UpdateCoachProfileInput,
  ) {
    return this.coachProfileService.update(
      updateCoachProfileInput.id,
      updateCoachProfileInput,
    );
  }

  @Mutation(() => CoachProfile)
  removeCoachProfile(@Args('id', { type: () => Int }) id: number) {
    return this.coachProfileService.remove(id);
  }

  @Mutation(() => CoachProfile)
  toggleCoachAvailability(@Args('id', { type: () => Int }) id: number) {
    return this.coachProfileService.toggleAvailability(id);
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() coachProfile: CoachProfile): Promise<User | null> {
    if (coachProfile.user) {
      return coachProfile.user;
    }
    return await this.coachProfileService.getUserByCoachProfileId(
      coachProfile.id,
    );
  }
}
