// src/modules/user/user.resolver.ts
import { BadRequestException } from '@nestjs/common';
import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UpdateUserAvatarInput } from './dto/update-user-avatar.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    if (!updateUserInput.id) {
      throw new BadRequestException('User ID is required');
    }
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }
  // src/modules/user/user.resolver.ts
  @Mutation(() => User, { name: 'updateUserAvatar' })
  updateUserAvatar(@Args('input') input: UpdateUserAvatarInput): Promise<User> {
    if (!input.avatarUrl) {
      throw new BadRequestException('avatarUrl là bắt buộc');
    }
    return this.userService.updateAvatar(input);
  }

  // ─── BỔ SUNG CÁC FIELD CHO FRONTEND SWIPE ─────────────────────────

  /** expose fullName dưới tên `name` */
  @ResolveField(() => String, { name: 'name', nullable: true })
  name(@Parent() user: User): string | null {
    return user.fullName ?? null;
  }

  /** tính tuổi từ dob */
  @ResolveField(() => Int, { nullable: true })
  age(@Parent() user: User): number | null {
    if (!user.dob) return null;
    const today = new Date();
    const bd = new Date(user.dob);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) {
      age--;
    }
    return age;
  }

  /** lấy URL avatar từ relation avatar.url */
  @ResolveField(() => String, { nullable: true })
  avatarUrl(@Parent() user: User): string | null {
    return user.avatar?.url ?? null;
  }

  /** expose trường address dưới tên location nếu bạn đã lưu address */
  @ResolveField(() => String, { nullable: true })
  location(@Parent() user: User): string | null {
    return user.address ?? null;
  }

  /** nếu bạn đã thêm cột schedule trong entity, trả về đây */
  @ResolveField(() => String, { nullable: true })
  schedule(@Parent() user: User): string | null {
    // Ví dụ entity có field `schedule?: string`
    return (user as any).schedule ?? null;
  }
}
