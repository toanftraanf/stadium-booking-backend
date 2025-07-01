import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swipe } from './enitities/swipe.entity';
import { Friendship } from '../friendship/entities/friendship.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,

    @InjectRepository(Friendship)
    private readonly friRepo: Repository<Friendship>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly usersService: UserService,
  ) {}

  /** Lấy ngẫu nhiên N candidate mà chưa swipe và chưa là bạn */
  async getCandidates(userId: number, limit = 10): Promise<User[]> {
    // 1) Subquery: danh sách bạn bè (userOneId/userTwoId)
    const friendsSub = this.friRepo
      .createQueryBuilder('f')
      .select(
        `
        CASE
          WHEN "f"."userOneId" = :userId THEN "f"."userTwoId"
          ELSE "f"."userOneId"
        END
      `,
        'fid',
      )
      .where(`"f"."userOneId" = :userId OR "f"."userTwoId" = :userId`);

    // 2) Subquery: danh sách đã swipe
    const swipedSub = this.swipeRepo
      .createQueryBuilder('s')
      .select(`"s"."swipeeId"`)
      .where(`"s"."swiperId" = :userId`);

    // 3) Main query: exclude chính mình, exclude friendsSub, exclude swipedSub
    return this.userRepo
      .createQueryBuilder('u')
      .where(`"u"."id" != :userId`, { userId })
      .andWhere(`"u"."id" NOT IN (${friendsSub.getQuery()})`)
      .andWhere(`"u"."id" NOT IN (${swipedSub.getQuery()})`)
      .setParameters({ userId })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  /** Khi user swipe trái/phải */
  async swipe(
    userId: number,
    targetId: number,
    liked: boolean,
  ): Promise<{ isMatch: boolean; swipe: Swipe }> {
    if (userId === targetId)
      throw new ForbiddenException('Không thể swipe chính mình');

    const [target, already] = await Promise.all([
      this.usersService.findOne(targetId),
      this.swipeRepo.findOne({
        where: { swiper: { id: userId }, swipee: { id: targetId } },
      }),
    ]);
    if (!target) throw new NotFoundException('User không tồn tại');
    if (already) throw new ConflictException('Đã swipe rồi');

    const swipe = this.swipeRepo.create({
      swiper: { id: userId } as any,
      swipee: { id: targetId } as any,
      liked,
    });
    await this.swipeRepo.save(swipe);

    let isMatch = false;
    if (liked) {
      const reciprocal = await this.swipeRepo.findOne({
        where: {
          swiper: { id: targetId },
          swipee: { id: userId },
          liked: true,
        },
      });
      if (reciprocal) {
        const [u1, u2] =
          userId < targetId ? [userId, targetId] : [targetId, userId];
        const exists = await this.friRepo.findOne({
          where: { userOne: { id: u1 }, userTwo: { id: u2 } },
        });
        if (!exists) {
          const f = this.friRepo.create({
            userOne: { id: u1 } as any,
            userTwo: { id: u2 } as any,
          });
          await this.friRepo.save(f);
        }
        isMatch = true;
      }
    }
    return { swipe, isMatch };
  }
}
