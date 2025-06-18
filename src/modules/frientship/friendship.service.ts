import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import {
  FriendRequest,
  FriendRequestStatus,
} from './entities/friend-request.entity';
import { Friendship } from './entities/friendship.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly frRepo: Repository<FriendRequest>,
    @InjectRepository(Friendship)
    private readonly fRepo: Repository<Friendship>,
    private readonly usersService: UserService,
  ) {}

  /** Gửi request */
  async sendRequest(requesterId: number, recipientId: number) {
    if (requesterId === recipientId) {
      throw new ForbiddenException('Không thể gửi cho chính mình');
    }

    const [existing, recipient] = await Promise.all([
      this.frRepo.findOne({
        where: {
          requester: { id: requesterId },
          recipient: { id: recipientId },
          status: FriendRequestStatus.PENDING,
        },
      }),
      this.usersService.findOne(recipientId),
    ]);
    if (!recipient) throw new NotFoundException('Người nhận không tồn tại');
    if (existing) throw new ConflictException('Đã gửi yêu cầu rồi');

    const fr = this.frRepo.create({
      requester: { id: requesterId } as any,
      recipient: { id: recipientId } as any,
    });
    return this.frRepo.save(fr);
  }

  /** Xem tất cả request đến */
  findIncomingRequests(userId: number) {
    return this.frRepo.find({
      where: { recipient: { id: userId }, status: FriendRequestStatus.PENDING },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Chấp nhận / từ chối */
  async respondRequest(
    userId: number,
    requestId: string,
    status: FriendRequestStatus,
  ) {
    const fr = await this.frRepo.findOne({
      where: { id: requestId },
      relations: ['recipient', 'requester'],
    });
    if (!fr) throw new NotFoundException('Yêu cầu không tồn tại');
    if (fr.recipient.id !== userId) {
      throw new ForbiddenException('Không có quyền');
    }
    if (fr.status !== FriendRequestStatus.PENDING) {
      throw new ConflictException('Đã xử lý rồi');
    }

    fr.status = status;
    await this.frRepo.save(fr);

    if (status === FriendRequestStatus.ACCEPTED) {
      // Tạo bản ghi friendship
      const [u1, u2] =
        fr.requester.id < fr.recipient.id
          ? [fr.requester.id, fr.recipient.id]
          : [fr.recipient.id, fr.requester.id];

      const exists = await this.fRepo.findOne({
        where: { userOne: { id: u1 }, userTwo: { id: u2 } },
      });
      if (!exists) {
        const f = this.fRepo.create({
          userOne: { id: u1 } as any,
          userTwo: { id: u2 } as any,
        });
        await this.fRepo.save(f);
      }
    }

    return fr;
  }

  /** Danh sách bạn bè */
  async getFriends(userId: number) {
    const friendships = await this.fRepo.find({
      where: [{ userOne: { id: userId } }, { userTwo: { id: userId } }],
      relations: ['userOne', 'userTwo'],
    });
    return friendships.map((f) =>
      f.userOne.id === userId ? f.userTwo : f.userOne,
    );
  }
}
