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
import { FieldService } from './field.service';

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
    private readonly fieldService: FieldService,
  ) {}

  async create(createStadiumInput: CreateStadiumInput): Promise<Stadium> {
    const stadium = this.stadiumRepository.create(createStadiumInput);
    return this.stadiumRepository.save(stadium);
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
      address: step1Data.address || '',
      latitude: step1Data.latitude,
      longitude: step1Data.longitude,
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

    // Create fields if provided
    if (step1Data.fields && step1Data.fields.length > 0) {
      await this.fieldService.createMultiple(savedStadium.id, step1Data.fields);
    }

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
      address: step1Data.address || '',
      latitude: step1Data.latitude,
      longitude: step1Data.longitude,
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

    // Update fields if provided
    if (step1Data.fields && step1Data.fields.length > 0) {
      // Remove existing fields and create new ones
      await this.fieldService.removeByStadiumId(stadiumId);
      await this.fieldService.createMultiple(stadiumId, step1Data.fields);
    }

    return this.findOne(stadiumId);
  }

  async findAll(): Promise<Stadium[]> {
    const stadiums = await this.stadiumRepository.find({
      relations: ['user', 'fields'],
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
      relations: ['user', 'fields'],
    });
    if (!stadium) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }
    return stadium;
  }

  async findByUserId(userId: number): Promise<Stadium[]> {
    return this.stadiumRepository.find({
      where: { userId },
      relations: ['user', 'fields'],
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
        try {
          console.log(
            `Calculating distance for stadium ${stadium.id}: ${
              stadium.address || stadium.googleMap
            }`,
          );

          let stadiumCoords: { lat: number; lng: number };

          // Check if stadium already has coordinates stored
          if (stadium.latitude && stadium.longitude) {
            stadiumCoords = {
              lat: stadium.latitude,
              lng: stadium.longitude,
            };
            console.log(
              `Using stored coordinates for stadium ${stadium.id}:`,
              stadiumCoords,
            );
          } else {
            // Use address if available, otherwise use googleMap
            const stadiumAddress =
              stadium.address && stadium.address.trim()
                ? stadium.address
                : stadium.googleMap;

            console.log(
              `Geocoding stadium ${stadium.id} address: ${stadiumAddress}`,
            );

            // Add delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

            // Geocode the stadium address to get coordinates
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

            stadiumCoords = stadiumGeocodeData.results[0].geometry.location;
            console.log(`Stadium ${stadium.id} coordinates:`, stadiumCoords);
          }

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
                stadiumAddress: stadium.address || stadium.googleMap,
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

  private async extractAddressFromGoogleMapLink(
    googleMapLink: string,
  ): Promise<{ address: string; latitude?: number; longitude?: number }> {
    try {
      const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
      if (!GOOGLE_PLACES_API_KEY) {
        console.warn(
          'GOOGLE_PLACES_API_KEY is not configured, skipping address extraction',
        );
        return { address: '' };
      }

      // Extract place ID from Google Maps link
      let placeId = '';

      // Handle different Google Maps URL formats
      const placeIdMatch = googleMapLink.match(/place_id[=:]([^&\s]+)/);
      const dataMatch = googleMapLink.match(/data=.*!1s([^!]+)/);
      const ftidMatch = googleMapLink.match(/ftid=([^&\s]+)/);

      if (placeIdMatch) {
        placeId = placeIdMatch[1];
      } else if (dataMatch) {
        placeId = dataMatch[1];
      } else if (ftidMatch) {
        placeId = ftidMatch[1];
      } else {
        // Try to extract coordinates and use reverse geocoding
        const coordsMatch = googleMapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordsMatch) {
          const lat = coordsMatch[1];
          const lng = coordsMatch[2];
          const address = await this.reverseGeocodeWithNewAPI(
            lat,
            lng,
            GOOGLE_PLACES_API_KEY,
          );
          return {
            address,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          };
        }

        console.warn(
          'Could not extract place ID or coordinates from Google Maps link:',
          googleMapLink,
        );
        return { address: '' };
      }

      // Use Google Places API (New) to get place details
      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'displayName,formattedAddress,location',
          },
        },
      );

      if (response.data && response.data.formattedAddress) {
        const address = response.data.formattedAddress;
        const location = response.data.location;
        console.log(
          'Extracted address from Google Maps link using New Places API:',
          address,
        );
        return {
          address,
          latitude: location?.latitude,
          longitude: location?.longitude,
        };
      } else {
        console.warn('New Places API: No address found for place ID:', placeId);
        return { address: '' };
      }
    } catch (error) {
      console.error(
        'Error extracting address from Google Maps link:',
        error.response?.data || error.message,
      );
      return { address: '' };
    }
  }

  private async reverseGeocodeWithNewAPI(
    lat: string,
    lng: string,
    apiKey: string,
  ): Promise<string> {
    try {
      // Use Places API (New) for reverse geocoding via Nearby Search
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          includedTypes: ['establishment'],
          maxResultCount: 1,
          locationRestriction: {
            circle: {
              center: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
              },
              radius: 50.0, // 50 meters radius
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
          },
        },
      );

      if (response.data.places && response.data.places.length > 0) {
        const address = response.data.places[0].formattedAddress;
        console.log('Reverse geocoded address using New Places API:', address);
        return address;
      } else {
        // Fallback to legacy Geocoding API if no places found
        return await this.reverseGeocodeWithLegacyAPI(lat, lng, apiKey);
      }
    } catch (error) {
      console.error(
        'Error in reverse geocoding with New Places API:',
        error.response?.data || error.message,
      );
      // Fallback to legacy Geocoding API
      return await this.reverseGeocodeWithLegacyAPI(lat, lng, apiKey);
    }
  }

  private async reverseGeocodeWithLegacyAPI(
    lat: string,
    lng: string,
    apiKey: string,
  ): Promise<string> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${lat},${lng}`,
            key: apiKey,
          },
        },
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        console.log('Reverse geocoded address using Legacy API:', address);
        return address;
      } else {
        console.warn('Legacy reverse geocoding failed:', response.data.status);
        return '';
      }
    } catch (error) {
      console.error('Error in legacy reverse geocoding:', error.message);
      return '';
    }
  }
}
