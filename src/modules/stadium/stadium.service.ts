import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CreateStadiumStepsInput } from './dto/create-stadium-steps.input';
import { CreateStadiumInput } from './dto/create-stadium.input';
import { FindStadiumsByAddressInput } from './dto/find-stadiums-by-address.input';
import { UpdateStadiumBankInput } from './dto/update-stadium-bank.input';
import { UpdateStadiumImagesInput } from './dto/update-stadium-images.input';
import { UpdateStadiumInput } from './dto/update-stadium.input';
import { Stadium } from './entities/stadium.entity';

interface StadiumWithDistance extends Stadium {
  distance: {
    value: number;
    text: string;
    duration: any;
  };
}

@Injectable()
export class StadiumService {
  private geocodeCache = new Map<string, any>();

  constructor(
    @InjectRepository(Stadium)
    private readonly stadiumRepository: Repository<Stadium>,
  ) {}

  async create(createStadiumInput: CreateStadiumInput): Promise<Stadium> {
    const stadium = this.stadiumRepository.create(createStadiumInput);
    const savedStadium = await this.stadiumRepository.save(stadium);
    return this.findOne(savedStadium.id);
  }

  async createWithSteps(
    createStadiumStepsInput: CreateStadiumStepsInput,
  ): Promise<Stadium> {
    const {
      step1Data,
      step2Data,
      userId,
      stadiumId,
      avatarUrl,
      bannerUrl,
      galleryUrls,
    } = createStadiumStepsInput;

    // If stadiumId is provided, update existing stadium
    if (stadiumId) {
      return this.updateWithSteps(stadiumId, createStadiumStepsInput);
    }

    // Create new stadium by merging step1Data and step2Data
    const stadiumData = {
      // From step1Data
      name: step1Data.name,
      description: step1Data.description || '',
      email: step1Data.email,
      endTime: step1Data.endTime,
      googleMap: step1Data.googleMap,
      otherContacts: step1Data.otherContacts,
      otherInfo: step1Data.otherInfo || '',
      phone: step1Data.phone,
      sports: step1Data.sports,
      startTime: step1Data.startTime,
      website: step1Data.website || '',
      avatarUrl,
      bannerUrl,
      galleryUrls,

      // From step2Data
      accountName: step2Data.accountName,
      accountNumber: step2Data.accountNumber,
      bank: step2Data.bank,
      price: step2Data.pricePerHalfHour, // Map pricePerHalfHour to price

      // System fields
      userId,
      status: 'active',
      rating: 0,
    };

    const stadium = this.stadiumRepository.create(stadiumData);
    const savedStadium = await this.stadiumRepository.save(stadium);
    return this.findOne(savedStadium.id);
  }

  private async updateWithSteps(
    stadiumId: number,
    createStadiumStepsInput: CreateStadiumStepsInput,
  ): Promise<Stadium> {
    const { step1Data, step2Data, avatarUrl, bannerUrl, galleryUrls } =
      createStadiumStepsInput;

    const updateData = {
      // From step1Data
      name: step1Data.name,
      description: step1Data.description || '',
      email: step1Data.email,
      endTime: step1Data.endTime,
      googleMap: step1Data.googleMap,
      otherContacts: step1Data.otherContacts,
      otherInfo: step1Data.otherInfo || '',
      phone: step1Data.phone,
      sports: step1Data.sports,
      startTime: step1Data.startTime,
      website: step1Data.website || '',
      avatarUrl,
      bannerUrl,
      galleryUrls,

      // From step2Data
      accountName: step2Data.accountName,
      accountNumber: step2Data.accountNumber,
      bank: step2Data.bank,
      price: step2Data.pricePerHalfHour,
    };

    await this.stadiumRepository.update(stadiumId, updateData);
    return this.findOne(stadiumId);
  }

  async findAll(): Promise<Stadium[]> {
    const stadiums = await this.stadiumRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    console.log(`Total stadiums in database: ${stadiums.length}`);
    stadiums.forEach((stadium) => {
      console.log(`- Stadium: ${stadium.name} (status: ${stadium.status})`);
    });

    return stadiums;
  }

  async findOne(id: number): Promise<Stadium> {
    const stadium = await this.stadiumRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!stadium) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }
    return stadium;
  }

  async findByUserId(userId: number): Promise<Stadium[]> {
    return this.stadiumRepository.find({
      where: { userId },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByName(name: string): Promise<Stadium[]> {
    if (!name || !name.trim()) {
      return this.findAll();
    }

    // Use ILIKE for case-insensitive search in PostgreSQL
    const searchTerm = `%${name.trim()}%`;

    console.log('=== SEARCH DEBUG ===');
    console.log('Searching stadiums with name containing:', name.trim());
    console.log('Search term:', searchTerm);

    // First, let's see all stadiums in the database
    const allStadiums = await this.stadiumRepository.find({
      relations: ['user'],
    });
    console.log(`Total stadiums in database: ${allStadiums.length}`);
    allStadiums.forEach((stadium) => {
      console.log(
        `- All Stadium: "${stadium.name}" (status: ${stadium.status}, id: ${stadium.id})`,
      );
    });

    const results = await this.stadiumRepository
      .createQueryBuilder('stadium')
      .leftJoinAndSelect('stadium.user', 'user')
      .where('stadium.name ILIKE :searchTerm', { searchTerm })
      .orderBy('stadium.createdAt', 'DESC')
      .getMany();

    console.log(`Found ${results.length} stadiums matching search term`);
    results.forEach((stadium) => {
      console.log(
        `- Matched Stadium: "${stadium.name}" (status: ${stadium.status})`,
      );
    });
    console.log('=== END SEARCH DEBUG ===');

    return results;
  }

  async update(
    id: number,
    updateStadiumInput: UpdateStadiumInput,
  ): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumInput);
    return this.findOne(id);
  }

  async updateBank(
    id: number,
    updateStadiumBankInput: UpdateStadiumBankInput,
  ): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumBankInput);
    return this.findOne(id);
  }

  async updateImages(
    id: number,
    updateStadiumImagesInput: UpdateStadiumImagesInput,
  ): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumImagesInput);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Stadium> {
    const stadium = await this.findOne(id);
    await this.stadiumRepository.delete(id);
    return stadium;
  }

  async findByAddress(input: FindStadiumsByAddressInput): Promise<Stadium[]> {
    const { address, radiusKm = 5 } = input;

    // Get all stadiums
    const allStadiums = await this.stadiumRepository.find({
      relations: ['user'],
      where: { status: 'active' },
    });

    // Filter stadiums that have address or googleMap
    const stadiumsWithAddress = allStadiums.filter(
      (stadium) =>
        (stadium.address && stadium.address.trim()) ||
        (stadium.googleMap &&
          stadium.googleMap.trim() &&
          !stadium.googleMap.includes('maps.google.com')),
    );

    console.log('Stadiums with address:', stadiumsWithAddress);

    if (stadiumsWithAddress.length === 0) {
      return [];
    }

    const GOONG_API_KEY = process.env.GOONG_API_KEY;
    if (!GOONG_API_KEY) {
      throw new Error('GOONG_API_KEY is not configured');
    }

    const nearbyStadiums: StadiumWithDistance[] = [];

    try {
      // Get coordinates for the input address
      console.log('Geocoding address:', address);
      const geocodeData = await this.geocodeWithRetry(address, GOONG_API_KEY);

      console.log('Geocode response:', geocodeData);

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Cannot find coordinates for the given address');
      }

      const originCoords = geocodeData.results[0].geometry.location;
      console.log('Origin coordinates:', originCoords);

      // Limit number of stadiums to process (to avoid rate limiting)
      const maxStadiumsToProcess = Math.min(stadiumsWithAddress.length, 10);
      const stadiumsToProcess = stadiumsWithAddress.slice(
        0,
        maxStadiumsToProcess,
      );

      console.log(
        `Processing ${stadiumsToProcess.length} stadiums (limited from ${stadiumsWithAddress.length})`,
      );

      // Check distance for each stadium
      for (const stadium of stadiumsToProcess) {
        // Use address if available, otherwise use googleMap
        const stadiumAddress =
          stadium.address && stadium.address.trim()
            ? stadium.address
            : stadium.googleMap;

        try {
          console.log(
            `Calculating distance for stadium ${stadium.id}: ${stadiumAddress}`,
          );

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

          // First, geocode the stadium address to get coordinates
          const stadiumGeocodeData = await this.geocodeWithRetry(
            stadiumAddress!,
            GOONG_API_KEY,
          );

          if (
            !stadiumGeocodeData.results ||
            stadiumGeocodeData.results.length === 0
          ) {
            console.warn(`Cannot geocode stadium address: ${stadiumAddress}`);
            continue;
          }

          const stadiumCoords = stadiumGeocodeData.results[0].geometry.location;
          console.log(`Stadium ${stadium.id} coordinates:`, stadiumCoords);

          // Try DistanceMatrix with coordinates
          try {
            // Add another small delay for DistanceMatrix API
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

            const distanceResponse = await axios.get(
              'https://rsapi.goong.io/DistanceMatrix',
              {
                params: {
                  origins: `${originCoords.lat},${originCoords.lng}`,
                  destinations: `${stadiumCoords.lat},${stadiumCoords.lng}`,
                  vehicle: 'car',
                  api_key: GOONG_API_KEY,
                },
              },
            );

            console.log(
              `Distance response for stadium ${stadium.id}:`,
              distanceResponse.data,
            );

            if (
              distanceResponse.data.rows &&
              distanceResponse.data.rows[0] &&
              distanceResponse.data.rows[0].elements &&
              distanceResponse.data.rows[0].elements[0]
            ) {
              const element = distanceResponse.data.rows[0].elements[0];

              if (element.status === 'OK' && element.distance) {
                const distanceInKm = element.distance.value / 1000;
                console.log(
                  `Road distance for stadium ${stadium.id}: ${distanceInKm}km`,
                );

                if (distanceInKm <= radiusKm) {
                  const stadiumWithDistance = {
                    ...stadium,
                    distance: {
                      value: distanceInKm,
                      text: element.distance.text,
                      duration: element.duration,
                    },
                  } as StadiumWithDistance;
                  nearbyStadiums.push(stadiumWithDistance);
                }
                continue; // Successfully calculated, skip haversine fallback
              }
            }
          } catch (distanceError) {
            if (distanceError.response?.status === 429) {
              console.warn(
                `Rate limit exceeded for DistanceMatrix, using haversine distance for stadium ${stadium.id}`,
              );
            } else {
              console.warn(
                `DistanceMatrix failed for stadium ${stadium.id}, using haversine distance`,
              );
            }
          }

          // Fallback: Calculate haversine (straight-line) distance
          const haversineDistance = this.calculateHaversineDistance(
            originCoords.lat,
            originCoords.lng,
            stadiumCoords.lat,
            stadiumCoords.lng,
          );

          console.log(
            `Haversine distance for stadium ${stadium.id}: ${haversineDistance}km`,
          );

          if (haversineDistance <= radiusKm) {
            const stadiumWithDistance = {
              ...stadium,
              distance: {
                value: haversineDistance,
                text: `${haversineDistance.toFixed(2)} km`,
                duration: { text: 'N/A', value: 0 },
              },
            } as StadiumWithDistance;
            nearbyStadiums.push(stadiumWithDistance);
          }
        } catch (error) {
          // Handle rate limit for geocoding
          if (error.response?.status === 429) {
            console.warn(
              `Rate limit exceeded for stadium ${stadium.id}, skipping this stadium`,
            );
          } else {
            console.error(
              `Error calculating distance for stadium ${stadium.id}:`,
              {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stadiumAddress: stadiumAddress,
              },
            );
          }
          // Continue with next stadium
        }
      }

      // Sort by distance
      nearbyStadiums.sort((a, b) => a.distance.value - b.distance.value);

      console.log(
        `Found ${nearbyStadiums.length} stadiums within ${radiusKm}km`,
      );

      // Filter out stadiums with null address before returning
      const validStadiums = nearbyStadiums.filter(
        (stadium) => stadium.address || stadium.googleMap,
      );

      return validStadiums;
    } catch (error) {
      console.error('Error in findByAddress:', error.message);
      throw new Error(`Error finding stadiums by address: ${error.message}`);
    }
  }

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async geocodeWithRetry(
    address: string,
    apiKey: string,
    maxRetries = 2,
  ): Promise<any> {
    // Check cache first
    if (this.geocodeCache.has(address)) {
      console.log(`Using cached geocode for: ${address}`);
      return this.geocodeCache.get(address);
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Geocoding attempt ${attempt} for: ${address}`);

        const response = await axios.get('https://rsapi.goong.io/geocode', {
          params: {
            address: address,
            api_key: apiKey,
          },
        });

        // Cache successful result
        this.geocodeCache.set(address, response.data);
        return response.data;
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn(
            `Rate limit hit on attempt ${attempt}, waiting longer...`,
          );
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
            continue;
          }
        }
        throw error;
      }
    }
  }
}
