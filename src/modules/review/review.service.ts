import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewInput } from './dto/create-review.input';
import { Review } from './entities/review.entity';
import { ReviewStats, RatingBreakdown } from './entities/review-stats.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Stadium } from '../stadium/entities/stadium.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Stadium)
    private readonly stadiumRepository: Repository<Stadium>,
  ) {}

  async create(createReviewInput: CreateReviewInput): Promise<Review> {
    const { userId, reservationId, stadiumId, rating, comment } =
      createReviewInput;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Trim and validate comment
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      throw new BadRequestException('Comment cannot be empty');
    }

    // Verify the reservation exists and belongs to the user
    const reservation = await this.reservationRepository.findOne({
      where: {
        id: reservationId,
        userId: userId,
        stadiumId: stadiumId,
      },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found or not completed');
    }

    // Check if reservation is completed
    if (reservation.status.toLowerCase() !== 'completed') {
      throw new BadRequestException('Reservation not found or not completed');
    }

    // Check if review already exists for this reservation
    const existingReview = await this.reviewRepository.findOne({
      where: {
        reservationId: reservationId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'Review already exists for this reservation',
      );
    }

    // Create the review
    const review = this.reviewRepository.create({
      reservationId,
      stadiumId,
      userId,
      rating,
      comment: trimmedComment,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update stadium's average rating
    await this.updateStadiumRating(stadiumId);

    // Return the review with relations
    const fullReview = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['user', 'user.avatar', 'stadium', 'reservation'],
    });

    if (!fullReview) {
      throw new NotFoundException(
        `Failed to retrieve created review with ID ${savedReview.id}`,
      );
    }

    return fullReview;
  }

  async findByStadiumId(stadiumId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { stadiumId },
      relations: ['user', 'user.avatar'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { userId },
      relations: ['stadium', 'reservation', 'user', 'user.avatar'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'user.avatar', 'stadium', 'reservation'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async getStadiumAverageRating(stadiumId: number): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .where('review.stadiumId = :stadiumId', { stadiumId })
      .getRawOne();

    return result.averageRating ? parseFloat(result.averageRating) : 0;
  }

  async getReviewStats(stadiumId: number): Promise<ReviewStats> {
    // Use a single efficient query to get all stats
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select([
        'AVG(review.rating) as "averageRating"',
        'COUNT(*) as "totalReviews"',
        'SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END) as "star1"',
        'SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END) as "star2"',
        'SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END) as "star3"',
        'SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END) as "star4"',
        'SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END) as "star5"',
      ])
      .where('review.stadiumId = :stadiumId', { stadiumId })
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

    const ratingBreakdown: RatingBreakdown = {
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
   * Updates the stadium's average rating based on all reviews
   * @param stadiumId - The ID of the stadium to update
   */
  async updateStadiumRating(stadiumId: number): Promise<void> {
    try {
      // Calculate the new average rating
      const averageRating = await this.getStadiumAverageRating(stadiumId);

      // Round to 1 decimal place
      const roundedRating = Math.round(averageRating * 10) / 10;

      // Update the stadium's rating
      await this.stadiumRepository.update(
        { id: stadiumId },
        { rating: roundedRating },
      );

      console.log(`Stadium ${stadiumId} rating updated to ${roundedRating}`);
    } catch (error) {
      console.error(`Failed to update stadium ${stadiumId} rating:`, error);
      // Don't throw error to avoid breaking the review creation process
      // This is a non-critical operation
    }
  }

  /**
   * Recalculates and updates the average rating for all stadiums
   * Useful for data maintenance or migration purposes
   */
  async recalculateAllStadiumRatings(): Promise<void> {
    try {
      // Get all stadiums that have reviews
      const stadiumsWithReviews = await this.reviewRepository
        .createQueryBuilder('review')
        .select('DISTINCT review.stadiumId', 'stadiumId')
        .getRawMany();

      console.log(
        `Recalculating ratings for ${stadiumsWithReviews.length} stadiums...`,
      );

      // Update each stadium's rating
      for (const stadium of stadiumsWithReviews) {
        await this.updateStadiumRating(stadium.stadiumId);
      }

      console.log('Finished recalculating all stadium ratings');
    } catch (error) {
      console.error('Failed to recalculate all stadium ratings:', error);
      throw error;
    }
  }
}
