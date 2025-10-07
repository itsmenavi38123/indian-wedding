import prisma from '@/config/prisma';
import { logger } from '@/logger';

interface VendorMatchingOptions {
  leadBudgetMin: number;
  leadBudgetMax: number;
  serviceTypes?: string; // Multiple service types the lead might need
  preferredLocations?: string[];
}

interface MatchedVendor {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  serviceTypes: string;
  minimumAmount: number;
  maximumAmount: number;
  matchScore: number; // 0-100 score based on how well they match
}

export function sanitizeData(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? Number(value) : value))
  );
}

/**
 * Find vendors that match a lead's budget and requirements
 */
export async function findMatchingVendors(
  options: VendorMatchingOptions
): Promise<MatchedVendor[]> {
  let { leadBudgetMin, leadBudgetMax, serviceTypes } = options;
  leadBudgetMin = Number(leadBudgetMin);
  leadBudgetMax = Number(leadBudgetMax);
  console.log(
    leadBudgetMin,
    leadBudgetMax,
    serviceTypes,
    'leadBudgetMin, leadBudgetMax, serviceTypes'
  );
  const leadAvgBudget = (leadBudgetMin + leadBudgetMax) / 2;

  try {
    // Always enforce budget overlap
    const whereConditions: any = {
      isActive: true,
      AND: [{ minimumAmount: { lte: leadBudgetMax } }, { maximumAmount: { gte: leadBudgetMin } }],
    };

    // Add service type filter if specified
    // if (serviceTypes && serviceTypes.length > 0) {
    //   const serviceTypesArray = serviceTypes.map((s: string) => s.trim()).filter(Boolean);

    //   whereConditions.AND.push({
    //     OR: serviceTypesArray.map((type) => ({
    //       serviceTypes: { contains: type, mode: 'insensitive' },
    //     })),
    //   });
    // }

    // Find vendors with overlapping budget ranges
    const vendors = await prisma.vendor.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        serviceTypes: true,
        minimumAmount: true,
        maximumAmount: true,
      },
    });

    // Calculate match scores and sort by best match
    const matchedVendors: MatchedVendor[] = vendors.map((vendor) => {
      let matchScore = 0;

      // Category match (40 points)

      // Budget range overlap (30 points)
      const overlapStart = Math.max(vendor.minimumAmount, leadBudgetMin);
      const overlapEnd = Math.min(vendor.maximumAmount, leadBudgetMax);
      if (overlapEnd >= overlapStart) {
        const overlapRange = overlapEnd - overlapStart;
        const leadRange = leadBudgetMax - leadBudgetMin;
        const overlapPercentage = (overlapRange / leadRange) * 100;
        matchScore += Math.min(30, overlapPercentage * 0.3);
      }

      // Exact budget match (30 points)
      if (leadAvgBudget >= vendor.minimumAmount && leadAvgBudget <= vendor.maximumAmount) {
        matchScore += 30;
      }

      return { ...vendor, matchScore: Math.round(matchScore) };
    });

    // Sort by match score (highest first)
    matchedVendors.sort((a, b) => b.matchScore - a.matchScore);

    logger.info(
      `Found ${matchedVendors.length} matching vendors for budget ${leadBudgetMin}-${leadBudgetMax}`
    );

    return matchedVendors;
  } catch (error) {
    logger.error('Error finding matching vendors:', error);
    throw error;
  }
}

// Helper to generate card data
export async function getTitleDescription(leadData: any) {
  const weddingDateStr = leadData.weddingDate
    ? new Date(leadData.weddingDate).toLocaleDateString('en-IN')
    : 'TBD';
  return {
    title: `${leadData.partner1Name} & ${leadData.partner2Name || 'Partner'} - Wedding`,
    description: `Wedding Date: ${weddingDateStr}
Budget: ₹${Number(leadData.budgetMin).toLocaleString('en-IN')} - ₹${Number(
      leadData.budgetMax
    ).toLocaleString('en-IN')}
Guests: ${leadData.guestCountMin || 'TBD'}-${leadData.guestCountMax || 'TBD'}
Location: ${leadData.preferredLocations?.join(', ') || 'TBD'}
Lead Source: ${leadData.leadSource || 'Direct'}
Contact: ${leadData.primaryContact || leadData.partner1Name}
Phone: ${leadData.phoneNumber || 'N/A'}
Email: ${leadData.email || 'N/A'}
Notes: ${leadData.initialNotes || 'No additional notes'}`,
  };
}

// createOrUpdateVendorCardsForLead
export async function createOrUpdateVendorCardsForLead(
  leadData: any,
  data: { teamIdsByVendor: Record<string, string[]> }
): Promise<void> {
  try {
    const vendorIds = Object.keys(data.teamIdsByVendor || {});
    console.log(vendorIds, 'vendorIds');
    if (!vendorIds.length) return;

    // Fetch existing cards
    const existingCards = await prisma.card.findMany({
      where: { originalLeadId: leadData.id },
      include: { cardTeams: true },
    });

    const existingVendorIds = existingCards.map((c) => c.vendorId);

    // Delete outdated cards
    const cardsToDelete = existingCards.filter((c) => !vendorIds.includes(c.vendorId));
    if (cardsToDelete.length) {
      const cardIdsToDelete = cardsToDelete.map((c) => c.id);

      // Delete related cardTeams first
      await prisma.cardTeam.deleteMany({
        where: { cardId: { in: cardIdsToDelete } },
      });

      // Then delete cards
      await prisma.card.deleteMany({
        where: { id: { in: cardIdsToDelete } },
      });

      console.log(`Deleted ${cardsToDelete.length} outdated cards`);
    }

    // Update existing cards
    const cardsToUpdate = existingCards.filter((c) => vendorIds.includes(c.vendorId));
    const updatePromises = cardsToUpdate.map(async (card) => {
      const teamIds = data.teamIdsByVendor[card.vendorId] || [];

      const updatedCard = await prisma.card.update({
        where: { id: card.id },
        data: {
          vendorId: card.vendorId,
          originalLeadId: leadData.id,
        },
      });

      // Reset card-team links
      await prisma.cardTeam.deleteMany({ where: { cardId: card.id } });
      await Promise.all(
        teamIds.map((teamId) => prisma.cardTeam.create({ data: { cardId: card.id, teamId } }))
      );

      return updatedCard;
    });

    // Create new cards
    const newVendorIds = vendorIds.filter((vId) => !existingVendorIds.includes(vId));
    const createPromises = newVendorIds.map(async (vendorId) => {
      const teamIds = data.teamIdsByVendor[vendorId] || [];

      const card = await prisma.card.create({
        data: {
          vendorId,
          originalLeadId: leadData.id,
        },
      });

      await Promise.all(
        teamIds.map((teamId) => prisma.cardTeam.create({ data: { cardId: card.id, teamId } }))
      );

      return card;
    });

    await Promise.all([...updatePromises, ...createPromises]);
    console.log(`Cards created/updated for lead ${leadData.partner1Name}`);
  } catch (error) {
    console.error('Error creating/updating vendor cards for lead:', error);
  }
}
