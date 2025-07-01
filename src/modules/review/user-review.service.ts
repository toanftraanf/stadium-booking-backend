import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserReviewInput } from './dto/create-user-review.input';
import { UserReview } from './entities/user-review.entity';
import {
  UserReviewStats,
  UserRatingBreakdown,
} from './entities/user-review-stats.entity';
import {
  CoachBooking,
  CoachBookingStatus,
} from '../reservation/entities/coach-booking.entity';
import { CoachProfile } from '../user/entities/coach-profile.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UserReviewService {
  constructor(
    @InjectRepository(UserReview)
    private readonly userReviewRepository: Repository<UserReview>,
    @InjectRepository(CoachBooking)
    private readonly coachBookingRepository: Repository<CoachBooking>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserReviewInput: CreateUserReviewInput,
  ): Promise<UserReview> {
    const { clientId, coachBookingId, coachProfileId, rating, comment } =
      createUserReviewInput;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Trim and validate comment
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      throw new BadRequestException('Comment cannot be empty');
    }

    // Verify the coach booking exists and belongs to the client
    const coachBooking = await this.coachBookingRepository.findOne({
      where: {
        id: coachBookingId,
        clientId: clientId,
        coachProfileId: coachProfileId,
      },
      relations: ['coachProfile'],
    });

    if (!coachBooking) {
      throw new BadRequestException('Coach booking not found or not completed');
    }

    // Check if booking is completed
    if (coachBooking.status !== CoachBookingStatus.COMPLETED) {
      throw new BadRequestException('Coach booking not found or not completed');
    }

    // Check if review already exists for this booking
    const existingReview = await this.userReviewRepository.findOne({
      where: {
        coachBookingId: coachBookingId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'Review already exists for this coach booking',
      );
    }

    // Create the review
    const userReview = this.userReviewRepository.create({
      coachBookingId,
      coachProfileId,
      clientId,
      rating,
      comment: trimmedComment,
    });

    const savedReview = await this.userReviewRepository.save(userReview);

    // Update coach's average rating
    await this.updateCoachRating(coachProfileId);

    // Return the review with relations
    const fullReview = await this.userReviewRepository.findOne({
      where: { id: savedReview.id },
      relations: [
        'client',
        'client.avatar',
        'coachProfile',
        'coachProfile.user',
        'coachBooking',
      ],
    });

    if (!fullReview) {
      throw new NotFoundException(
        `Failed to retrieve created review with ID ${savedReview.id}`,
      );
    }

    return fullReview;
  }

  async findByCoachProfileId(coachProfileId: number): Promise<UserReview[]> {
    return await this.userReviewRepository.find({
      where: { coachProfileId },
      relations: ['client', 'client.avatar'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClientId(clientId: number): Promise<UserReview[]> {
    return await this.userReviewRepository.find({
      where: { clientId },
      relations: [
        'coachProfile',
        'coachProfile.user',
        'coachBooking',
        'client',
        'client.avatar',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<UserReview> {
    const review = await this.userReviewRepository.findOne({
      where: { id },
      relations: [
        'client',
        'client.avatar',
        'coachProfile',
        'coachProfile.user',
        'coachBooking',
      ],
    });

    if (!review) {
      throw new NotFoundException(`User review with ID ${id} not found`);
    }

    return review;
  }

  async getCoachAverageRating(coachProfileId: number): Promise<number> {
    const result = await this.userReviewRepository
      .createQueryBuilder('userReview')
      .select('AVG(userReview.rating)', 'averageRating')
      .where('userReview.coachProfileId = :coachProfileId', { coachProfileId })
      .getRawOne();

    return result.averageRating ? parseFloat(result.averageRating) : 0;
  }

  async getUserReviewStats(coachProfileId: number): Promise<UserReviewStats> {
    // Use a single efficient query to get all stats
    const result = await this.userReviewRepository
      .createQueryBuilder('userReview')
      .select([
        'AVG(userReview.rating) as "averageRating"',
        'COUNT(*) as "totalReviews"',
        'SUM(CASE WHEN userReview.rating = 1 THEN 1 ELSE 0 END) as "star1"',
        'SUM(CASE WHEN userReview.rating = 2 THEN 1 ELSE 0 END) as "star2"',
        'SUM(CASE WHEN userReview.rating = 3 THEN 1 ELSE 0 END) as "star3"',
        'SUM(CASE WHEN userReview.rating = 4 THEN 1 ELSE 0 END) as "star4"',
        'SUM(CASE WHEN userReview.rating = 5 THEN 1 ELSE 0 END) as "star5"',
      ])
      .where('userReview.coachProfileId = :coachProfileId', { coachProfileId })
      .getRawOne();

    const totalReviews = parseInt(result.totalReviews) || 0;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {
          star1: 0,
          star2: 0,
          star3: 0,
          star4: 0,
          star5: 0,
        },
      };
    }

    const averageRating = result.averageRating
      ? Math.round(parseFloat(result.averageRating) * 10) / 10
      : 0;

    const ratingBreakdown: UserRatingBreakdown = {
      star1: parseInt(result.star1) || 0,
      star2: parseInt(result.star2) || 0,
      star3: parseInt(result.star3) || 0,
      star4: parseInt(result.star4) || 0,
      star5: parseInt(result.star5) || 0,
    };

    return {
      averageRating,
      totalReviews,
      ratingBreakdown,
    };
  }

  /**
   * Updates the coach's average rating based on all reviews
   * @param coachProfileId - The ID of the coach profile to update
   */
  async updateCoachRating(coachProfileId: number): Promise<void> {
    try {
      // Calculate the new average rating
      const averageRating = await this.getCoachAverageRating(coachProfileId);

      // Round to 1 decimal place
      const roundedRating = Math.round(averageRating * 10) / 10;

      // Update the user's rating (since coach profile relates to user)
      const coachProfile = await this.coachProfileRepository.findOne({
        where: { id: coachProfileId },
        relations: ['user'],
      });

      if (coachProfile && coachProfile.user) {
        await this.userRepository.update(coachProfile.user.id, {
          rating: roundedRating,
        });
      }
    } catch (error) {
      console.error(
        `Failed to update coach rating for profile ${coachProfileId}:`,
        error,
      );
      // Don't throw here to avoid failing the review creation
    }
  }

  /**
   * Recalculates and updates all coach ratings
   */
  async recalculateAllCoachRatings(): Promise<void> {
    const coachProfiles = await this.coachProfileRepository.find({
      relations: ['user'],
    });

    for (const coachProfile of coachProfiles) {
      await this.updateCoachRating(coachProfile.id);
    }
  }
}
