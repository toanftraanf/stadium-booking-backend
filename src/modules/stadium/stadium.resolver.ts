import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateStadiumStepsInput } from './dto/create-stadium-steps.input';
import { CreateStadiumInput } from './dto/create-stadium.input';
import { FindStadiumsByAddressInput } from './dto/find-stadiums-by-address.input';
import { UpdateStadiumBankInput } from './dto/update-stadium-bank.input';
import { UpdateStadiumImagesInput } from './dto/update-stadium-images.input';
import { UpdateStadiumInput } from './dto/update-stadium.input';
import { Stadium } from './entities/stadium.entity';
import { StadiumService } from './stadium.service';

@Resolver(() => Stadium)
export class StadiumResolver {
  constructor(private readonly stadiumService: StadiumService) {}

  @Mutation(() => Stadium)
  createStadium(
    @Args('createStadiumInput') createStadiumInput: CreateStadiumInput,
  ) {
    return this.stadiumService.create(createStadiumInput);
  }

  @Mutation(() => Stadium)
  createStadiumWithSteps(
    @Args('createStadiumStepsInput')
    createStadiumStepsInput: CreateStadiumStepsInput,
  ) {
    return this.stadiumService.createWithSteps(createStadiumStepsInput);
  }

  @Query(() => [Stadium], { name: 'stadiums' })
  findAll() {
    return this.stadiumService.findAll();
  }

  @Query(() => Stadium, { name: 'stadium' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.stadiumService.findOne(id);
  }

  @Query(() => [Stadium], { name: 'stadiumsByUser' })
  findByUserId(@Args('userId', { type: () => Int }) userId: number) {
    return this.stadiumService.findByUserId(userId);
  }

  @Query(() => [Stadium], { name: 'stadiumsByName' })
  findByName(@Args('name') name: string) {
    return this.stadiumService.findByName(name);
  }

  @Query(() => [Stadium], { name: 'stadiumsByAddress' })
  findByAddress(@Args('input') input: FindStadiumsByAddressInput) {
    return this.stadiumService.findByAddress(input);
  }

  @Mutation(() => Stadium)
  updateStadium(
    @Args('updateStadiumInput') updateStadiumInput: UpdateStadiumInput,
  ) {
    return this.stadiumService.update(
      updateStadiumInput.id,
      updateStadiumInput,
    );
  }

  @Mutation(() => Stadium)
  updateStadiumBank(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateStadiumBankInput,
  ) {
    return this.stadiumService.updateBank(id, input);
  }

  @Mutation(() => Stadium)
  updateStadiumImages(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateStadiumImagesInput,
  ) {
    return this.stadiumService.updateImages(id, input);
  }

  @Mutation(() => Stadium)
  removeStadium(@Args('id', { type: () => Int }) id: number) {
    return this.stadiumService.remove(id);
  }
}
