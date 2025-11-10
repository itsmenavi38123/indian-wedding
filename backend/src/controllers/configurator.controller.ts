import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes } from '@/constant';
import { logger } from '@/logger';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import slugify from 'slugify';
import { openAIService } from '@/services/openai.service';

export class ConfiguratorController {
  // ================= STEP 1: CREATE GUEST WEDDING PLAN (PUBLIC - NO AUTH) =================
  // This creates a temporary wedding plan instance as soon as user hits "Next" on Step 1
  public async createGuestWeddingPlan(req: Request, res: Response) {
    try {
      const { person1Name, person2Name, weddingStartDate, weddingEndDate, guests, baseLocation } =
        req.body;

      if (!person1Name || !person2Name) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Both person names are required'));
      }

      // Merge names for display: "Rahul & Anjali"
      const coupleNames = `${person1Name.trim()} & ${person2Name.trim()}`;

      // Generate unique subdomain by concatenating names WITHOUT hyphen
      // Example: "Rahul Kumar" + "Anjali Sharma" -> "rahulkumaranjalisharma"
      // Example: "Rahul" + "Anjali" -> "rahulanjali"
      const person1Clean = person1Name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
      const person2Clean = person2Name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const baseSubdomain = `${person1Clean}${person2Clean}`;

      // Check if subdomain exists, add number if needed
      let subdomain = baseSubdomain;
      let counter = 1;
      while (await prisma.weddingPlan.findUnique({ where: { subdomain } })) {
        subdomain = `${baseSubdomain}${counter}`;
        counter++;
      }

      // Create a guest wedding plan (userId will be null until they login at Step 7)
      const weddingPlan = await prisma.weddingPlan.create({
        data: {
          coupleNames,
          subdomain,
          guests: guests || 100,
          baseLocation: baseLocation || null,
          weddingStartDate: weddingStartDate ? new Date(weddingStartDate) : null,
          weddingEndDate: weddingEndDate ? new Date(weddingEndDate) : null,
          wizardStep: 1,
          wizardCompleted: false,
          siteThemeColor: '#ad8b3a', // Default gold color
        },
      });

      logger.info(`Guest wedding plan created: ${weddingPlan.id} for ${coupleNames}`);

      return res.status(statusCodes.CREATED).json(
        new ApiResponse(
          statusCodes.CREATED,
          {
            weddingPlan: {
              id: weddingPlan.id,
              coupleNames: weddingPlan.coupleNames,
              subdomain: weddingPlan.subdomain,
              guestSessionToken: weddingPlan.id, // Use plan ID as session token
            },
          },
          'Wedding plan instance created successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in createGuestWeddingPlan: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= UPDATE GUEST WEDDING PLAN (PUBLIC) =================
  // Update the guest wedding plan as they progress through steps
  public async updateGuestWeddingPlan(req: Request, res: Response) {
    try {
      const { weddingPlanId } = req.params;
      const updateData = req.body;

      // Find the wedding plan
      const existingPlan = await prisma.weddingPlan.findUnique({
        where: { id: weddingPlanId },
      });

      if (!existingPlan) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Wedding plan not found'));
      }

      // Prepare update data
      const dataToUpdate: any = {};
      if (updateData.vibe !== undefined) dataToUpdate.vibe = updateData.vibe;
      if (updateData.region !== undefined) dataToUpdate.region = updateData.region;

      // Handle budget fields - only convert to BigInt if value is not null/undefined/0
      if (updateData.budgetMin !== undefined) {
        dataToUpdate.budgetMin =
          updateData.budgetMin && updateData.budgetMin > 0 ? BigInt(updateData.budgetMin) : null;
      }
      if (updateData.budgetMax !== undefined) {
        dataToUpdate.budgetMax =
          updateData.budgetMax && updateData.budgetMax > 0 ? BigInt(updateData.budgetMax) : null;
        dataToUpdate.totalBudget =
          updateData.budgetMax && updateData.budgetMax > 0 ? BigInt(updateData.budgetMax) : null;
      }

      if (updateData.wizardStep !== undefined) dataToUpdate.wizardStep = updateData.wizardStep;
      if (updateData.siteCoverPhoto !== undefined)
        dataToUpdate.siteCoverPhoto = updateData.siteCoverPhoto;
      if (updateData.siteThemeColor !== undefined)
        dataToUpdate.siteThemeColor = updateData.siteThemeColor;
      if (updateData.siteIntroMessage !== undefined)
        dataToUpdate.siteIntroMessage = updateData.siteIntroMessage;

      const updatedPlan = await prisma.weddingPlan.update({
        where: { id: weddingPlanId },
        data: dataToUpdate,
      });

      logger.info(`Guest wedding plan updated: ${updatedPlan.id} - Step ${updatedPlan.wizardStep}`);

      // Convert BigInt fields to strings for JSON serialization
      const serializedPlan = {
        ...updatedPlan,
        budgetMin: updatedPlan.budgetMin?.toString() || null,
        budgetMax: updatedPlan.budgetMax?.toString() || null,
        totalBudget: updatedPlan.totalBudget?.toString() || null,
      };

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            weddingPlan: serializedPlan,
          },
          'Wedding plan updated successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in updateGuestWeddingPlan: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= CLAIM WEDDING PLAN (AUTHENTICATED) =================
  // This claims a guest wedding plan when user logs in at Step 7
  public async claimWeddingPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { weddingPlanId } = req.body;

      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, 'Please login first'));
      }

      // Find the guest wedding plan
      const guestPlan = await prisma.weddingPlan.findUnique({
        where: { id: weddingPlanId },
      });

      if (!guestPlan) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Wedding plan not found'));
      }

      // Claim it by assigning the userId
      const claimedPlan = await prisma.weddingPlan.update({
        where: { id: weddingPlanId },
        data: {
          userId,
          wizardCompleted: true,
          wizardStep: 7,
        },
      });

      logger.info(`Wedding plan claimed by user ${userId}: ${claimedPlan.id}`);

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            weddingPlan: claimedPlan,
          },
          'Wedding plan claimed successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in claimWeddingPlan: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= LEGACY: CREATE WEDDING PLAN (AUTHENTICATED) =================
  // Keeping for backward compatibility
  public async startConfiguration(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const {
        coupleNames,
        weddingStartDate,
        weddingEndDate,
        guests,
        baseLocation,
        vibe,
        region,
        budgetMin,
        budgetMax,
      } = req.body;

      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(
              statusCodes.UNAUTHORIZED,
              null,
              'Please login to save your wedding plan'
            )
          );
      }

      // Generate unique subdomain from couple names
      const baseSubdomain = slugify(coupleNames || 'wedding', {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

      // Check if subdomain exists, add number if needed
      let subdomain = baseSubdomain;
      let counter = 1;
      while (await prisma.weddingPlan.findUnique({ where: { subdomain } })) {
        subdomain = `${baseSubdomain}${counter}`;
        counter++;
      }

      const weddingPlan = await prisma.weddingPlan.create({
        data: {
          userId,
          coupleNames,
          subdomain,
          guests,
          baseLocation,
          weddingStartDate: weddingStartDate ? new Date(weddingStartDate) : null,
          weddingEndDate: weddingEndDate ? new Date(weddingEndDate) : null,
          vibe,
          region,
          budgetMin: budgetMin ? BigInt(budgetMin) : null,
          budgetMax: budgetMax ? BigInt(budgetMax) : null,
          totalBudget: budgetMax ? BigInt(budgetMax) : null,
          wizardStep: 7,
          wizardCompleted: true,
          siteThemeColor: '#ad8b3a', // Default gold color
        },
      });

      logger.info(`Wedding plan created: ${weddingPlan.id}`);

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          weddingPlan: {
            id: weddingPlan.id,
            coupleNames: weddingPlan.coupleNames,
            subdomain: weddingPlan.subdomain,
            wizardCompleted: weddingPlan.wizardCompleted,
          },
        })
      );
    } catch (error: any) {
      logger.error(`Error in startConfiguration: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= STEP 2: GET WEDDING VIBES (PUBLIC - NO AUTH) =================
  public async getVibes(req: Request, res: Response) {
    try {
      const { search, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { isActive: true };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { tagline: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [vibes, total] = await Promise.all([
        prisma.weddingVibe.findMany({
          where,
          orderBy: { order: 'asc' },
          skip,
          take: limitNum,
        }),
        prisma.weddingVibe.count({ where }),
      ]);

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          vibes,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      logger.error(`Error in getVibes: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= STEP 3: GET REGIONS (PUBLIC - NO AUTH) =================
  public async getRegions(req: Request, res: Response) {
    try {
      const { vibe, search } = req.query;

      // Map vibes to preferred cities
      const vibeDestinationMap: Record<string, string[]> = {
        'Coastal Escape': ['Goa', 'Maldives', 'Phuket', 'Kerala'],
        'Tropical Paradise': ['Bali', 'Phuket', 'Kerala', 'Goa', 'Maldives'],
        'Urban Luxe': ['Mumbai', 'Dubai', 'Delhi'],
        'Regal Royale': ['Udaipur', 'Jaipur', 'Delhi', 'Tuscany'],
        'Desert Mirage': ['Dubai', 'Jaipur', 'Udaipur'],
        'Vineyard Romance': ['Tuscany'],
        'Mountain Retreat': ['Udaipur', 'Jaipur', 'Kerala'],
        'Bohemian Garden': ['Tuscany', 'Kerala', 'Bali', 'Goa'],
        'Art Deco Glam': ['Mumbai', 'Delhi'],
        'Sustainable Chic': ['Bali', 'Kerala', 'Goa'],
        'Traditional Heritage': ['Udaipur', 'Jaipur', 'Delhi'],
        'Fusion Festivities': ['Mumbai', 'Delhi', 'Goa', 'Dubai'],
      };

      // Get all venues (grouped by country) from VendorService
      const venues = await prisma.vendorService.findMany({
        where: {
          category: 'venue',
          vendor: {
            isActive: true,
          },
        },
        select: {
          country: true,
          city: true,
        },
        distinct: ['country', 'city'],
      });

      // Group by country
      const regionMap: Record<string, any> = {};

      venues.forEach((venue) => {
        if (!regionMap[venue.country]) {
          const regionIcons: Record<string, string> = {
            India: '🇮🇳',
            UAE: '🇦🇪',
            Indonesia: '🇮🇩',
            Thailand: '🇹🇭',
            'Sri Lanka': '🇱🇰',
            Maldives: '🇲🇻',
            Italy: '🇮🇹',
            France: '🇫🇷',
            USA: '🇺🇸',
          };

          regionMap[venue.country] = {
            id: venue.country.toLowerCase().replace(/\s+/g, '-'),
            name: venue.country,
            icon: regionIcons[venue.country] || '🌍',
            popularCities: [] as string[],
          };
        }

        if (venue.city && !regionMap[venue.country].popularCities.includes(venue.city)) {
          regionMap[venue.country].popularCities.push(venue.city);
        }
      });

      let regions = Object.values(regionMap);

      // VIBE-BASED FILTERING: Filter regions based on selected vibe
      if (vibe && vibeDestinationMap[vibe as string]) {
        const preferredCities = vibeDestinationMap[vibe as string];

        // Filter regions that have at least one city matching the vibe's preferred destinations
        regions = regions.filter((region: any) =>
          region.popularCities.some((city: string) =>
            preferredCities.some(
              (preferredCity: string) =>
                city.toLowerCase().includes(preferredCity.toLowerCase()) ||
                preferredCity.toLowerCase().includes(city.toLowerCase())
            )
          )
        );

        // Sort regions by relevance (more matching cities first)
        regions.sort((a: any, b: any) => {
          const aMatches = a.popularCities.filter((city: string) =>
            preferredCities.some(
              (preferredCity: string) =>
                city.toLowerCase().includes(preferredCity.toLowerCase()) ||
                preferredCity.toLowerCase().includes(city.toLowerCase())
            )
          ).length;

          const bMatches = b.popularCities.filter((city: string) =>
            preferredCities.some(
              (preferredCity: string) =>
                city.toLowerCase().includes(preferredCity.toLowerCase()) ||
                preferredCity.toLowerCase().includes(city.toLowerCase())
            )
          ).length;

          return bMatches - aMatches;
        });
      }

      // Apply search filter
      if (search) {
        const searchLower = (search as string).toLowerCase();
        regions = regions.filter(
          (region: any) =>
            region.name.toLowerCase().includes(searchLower) ||
            region.popularCities.some((city: string) => city.toLowerCase().includes(searchLower))
        );
      }

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          regions,
          total: regions.length,
          filteredByVibe: !!vibe,
        })
      );
    } catch (error: any) {
      logger.error(`Error in getRegions: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= STEP 3: GET VENUES BY REGION (PUBLIC - NO AUTH) =================
  public async getVenuesByRegion(req: Request, res: Response) {
    try {
      const { region } = req.params;
      const {
        budgetMax,
        search,
        page = '1',
        limit = '20',
        sortBy = 'price',
        sortOrder = 'asc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {
        category: 'venue',
        country: region,
        vendor: {
          isActive: true,
        },
      };

      // Budget filter
      if (budgetMax) {
        where.price = {
          lte: Number(budgetMax) * 0.3, // Venues typically 30% of total budget
        };
      }

      // Search filter
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { city: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Sort options
      const orderBy: any = {};
      if (sortBy === 'price') {
        orderBy.price = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.title = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      const [venueServices, total] = await Promise.all([
        prisma.vendorService.findMany({
          where,
          include: {
            vendor: true,
            media: true,
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.vendorService.count({ where }),
      ]);

      // Transform to match frontend expectations
      const venues = venueServices.map((service) => {
        const images = service.media.filter((m) => m.type === 'IMAGE').map((m) => m.url);
        const thumbnail = service.media.find((m) => m.type === 'THUMBNAIL')?.url;

        const locationParts = [service.city, service.state, service.country].filter(Boolean);
        const location = locationParts.join(', ');

        return {
          id: service.id,
          name: service.title,
          location,
          description: service.description || '',
          capacity: service.capacity || 'Contact for details',
          basePrice: service.price,
          images: thumbnail ? [thumbnail, ...images] : images,
          country: service.country,
          state: service.state,
          city: service.city,
        };
      });

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          venues,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      logger.error(`Error in getVenuesByRegion: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= STEP 6: GET VENDORS (PUBLIC - NO AUTH) =================
  public async getVendors(req: Request, res: Response) {
    try {
      const {
        category,
        region,
        budgetMax,
        search,
        page = '1',
        limit = '50',
        sortBy = 'price',
        sortOrder = 'asc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const serviceFilters: any = {
        vendor: {
          is: {
            isActive: true,
          },
        },
      };

      // Budget filter
      if (budgetMax) {
        serviceFilters.price = {
          lte: Number(budgetMax) * 0.4, // Max 40% of total budget per service
        };
      }

      // Category filter
      if (category) {
        serviceFilters.category = category as string;
      }

      // Region filter
      if (region) {
        serviceFilters.country = region as string;
      }

      // Search filter
      if (search) {
        serviceFilters.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { vendor: { is: { name: { contains: search as string, mode: 'insensitive' } } } },
        ];
      }

      // Sort options
      const orderBy: any = {};
      if (sortBy === 'price') {
        orderBy.price = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.title = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      const [vendorServices, total] = await Promise.all([
        prisma.vendorService.findMany({
          where: serviceFilters,
          include: {
            vendor: true,
            media: {
              where: { type: 'THUMBNAIL' },
              take: 1,
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.vendorService.count({ where: serviceFilters }),
      ]);

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          vendors: vendorServices,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      logger.error(`Error in getVendors: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= STEP 7: PUBLISH WEDDING SITE (AUTHENTICATED) =================
  public async publishSite(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { weddingPlanId, siteCoverPhoto, siteThemeColor, siteIntroMessage } = req.body;

      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, 'Please login to publish your site')
          );
      }

      const updated = await prisma.weddingPlan.update({
        where: { id: weddingPlanId, userId },
        data: {
          siteCoverPhoto: siteCoverPhoto || null,
          siteThemeColor: siteThemeColor || '#ad8b3a',
          siteIntroMessage: siteIntroMessage || null,
          sitePublished: true,
          wizardCompleted: true,
        },
      });

      logger.info(`Wedding site published: ${updated.subdomain}`);

      // Generate proper site URL based on environment
      const baseDomain = process.env.BASE_DOMAIN || 'indianweddings.com';
      const frontendUrl =
        process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

      // Check if we're in development (localhost)
      const isDevelopment = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');

      let siteUrl: string;
      if (isDevelopment) {
        // For localhost, use the main frontend URL with subdomain as path
        siteUrl = `${frontendUrl}/wedding/${updated.subdomain}`;
      } else {
        // For production, use subdomain
        siteUrl = `https://${updated.subdomain}.${baseDomain}`;
      }

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          weddingPlan: updated,
          siteUrl,
          subdomain: updated.subdomain,
        })
      );
    } catch (error: any) {
      logger.error(`Error in publishSite: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= DELETE GUEST WEDDING PLAN (PUBLIC) =================
  public async deleteGuestWeddingPlan(req: Request, res: Response) {
    try {
      const { weddingPlanId } = req.params;

      // Find the wedding plan
      const existingPlan = await prisma.weddingPlan.findUnique({
        where: { id: weddingPlanId },
      });

      if (!existingPlan) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Wedding plan not found'));
      }

      // Delete the wedding plan
      await prisma.weddingPlan.delete({
        where: { id: weddingPlanId },
      });

      logger.info(`Guest wedding plan deleted: ${weddingPlanId}`);

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, 'Wedding plan deleted successfully'));
    } catch (error: any) {
      logger.error(`Error in deleteGuestWeddingPlan: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= GET PUBLIC WEDDING SITE (PUBLIC - NO AUTH) =================
  public async getPublicSite(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;

      // First check if wedding exists at all (regardless of published status)
      const weddingPlan = await prisma.weddingPlan.findUnique({
        where: { subdomain },
        include: {
          destination: true,
          events: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!weddingPlan) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Wedding site not found'));
      }

      // Check if wedding exists but not published
      if (!weddingPlan.sitePublished) {
        return res.status(statusCodes.OK).json(
          new ApiResponse(statusCodes.OK, {
            published: false,
            coupleNames: weddingPlan.coupleNames,
            message: 'This wedding is still being planned and has not been published yet.',
          })
        );
      }

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          published: true,
          weddingSite: {
            coupleNames: weddingPlan.coupleNames,
            coverPhoto: weddingPlan.siteCoverPhoto,
            themeColor: weddingPlan.siteThemeColor,
            introMessage: weddingPlan.siteIntroMessage,
            events: weddingPlan.events,
            dates: {
              start: weddingPlan.weddingStartDate,
              end: weddingPlan.weddingEndDate,
            },
          },
        })
      );
    } catch (error: any) {
      logger.error(`Error in getPublicSite: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= GENERATE PERSONALIZED VIBE DESCRIPTION (PUBLIC) =================
  public async generatePersonalizedVibeDescription(req: Request, res: Response) {
    try {
      const { vibeName, coupleNames, guests, weddingDate } = req.body;

      if (!vibeName) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Vibe name is required'));
      }

      logger.info(`Generating personalized description for vibe: ${vibeName}`);

      const personalizedDescription = await openAIService.generatePersonalizedVibeDescription(
        vibeName,
        {
          coupleNames,
          guests,
          weddingDate,
        }
      );

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            vibeName,
            description: personalizedDescription,
          },
          'Personalized description generated successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in generatePersonalizedVibeDescription: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }
}
