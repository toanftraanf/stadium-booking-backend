import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { SportService } from './sport.service';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { AddFavoriteSportInput } from './dto/add-favorite-sport.input';

@Resolver(() => Sport)
export class SportResolver {
  constructor(private readonly sportService: SportService) {}

  @Mutation(() => Sport)
  createSport(@Args('createSportInput') createSportInput: CreateSportInput) {
    return this.sportService.create(createSportInput);
  }

  @Query(() => [Sport], { name: 'sports' })
  findAll() {
    return this.sportService.findAll();
  }

  @Query(() => Sport, { name: 'sport' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.sportService.findOne(id);
  }

  @Query(() => Sport, { name: 'sportWithUserCount' })
  findOneWithUserCount(@Args('id', { type: () => Int }) id: number) {
    return this.sportService.getSportWithUserCount(id);
  }

  @Mutation(() => Sport)
  updateSport(@Args('updateSportInput') updateSportInput: UpdateSportInput) {
    return this.sportService.update(updateSportInput.id, updateSportInput);
  }

  @Mutation(() => Sport)
  removeSport(@Args('id', { type: () => Int }) id: number) {
    return this.sportService.remove(id);
  }

  @Mutation(() => UserFavoriteSport)
  addFavoriteSport(
    @Args('addFavoriteSportInput') input: AddFavoriteSportInput,
  ) {
    return this.sportService.addFavoriteSport(input);
  }

  @Mutation(() => Boolean)
  removeFavoriteSport(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('sportId', { type: () => Int }) sportId: number,
  ) {
    return this.sportService.removeFavoriteSport(userId, sportId);
  }

  @Query(() => [Sport], { name: 'userFavoriteSports' })
  getUserFavoriteSports(@Args('userId', { type: () => Int }) userId: number) {
    return this.sportService.getUserFavoriteSports(userId);
  }

  @ResolveField(() => Int)
  async userCount(@Parent() sport: Sport) {
    const result = await this.sportService.getSportWithUserCount(sport.id);
    return result?.userCount ?? 0;
  }
}