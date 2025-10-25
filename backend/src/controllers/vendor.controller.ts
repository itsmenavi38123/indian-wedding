import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { errorMessages, successMessages, statusCodes } from '@/constant';
import { createVendorSchema, updateVendorSchema } from '@/validators/vendor/vendorAuth';
import { Parser } from 'json2csv';
import { AuthenticatedVendorRequest } from '@/middlewares/vendorAuthMiddleware';
import { sanitizeData } from '@/services/vendorMatching.service';
import { deleteFile } from '@/services/fileService';
import { File as MulterFile } from 'multer';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { LeadStatus } from '@prisma/client';
import { generateRandomPassword } from '@/utils/generatePassword';

export class VendorController {
  public async createVendor(req: Request, res: Response) {
    try {
      if (req.body.minimumAmount) req.body.minimumAmount = Number(req.body.minimumAmount);
      if (req.body.maximumAmount) req.body.maximumAmount = Number(req.body.maximumAmount);

      const body = createVendorSchema.parse(req.body);
      const {
        name,
        email,
        password,
        contactNo,
        serviceTypes,
        minimumAmount,
        maximumAmount,
        countryCode,
        teams = [],
      } = body;

      // Check duplicate vendor
      const existingVendor = await prisma.vendor.findUnique({ where: { email } });
      if (existingVendor) {
        return res
          .status(statusCodes.CONFLICT)
          .json(new ApiResponse(statusCodes.CONFLICT, null, errorMessages.USER_EXISTED));
      }

      const passwordHash = await bcrypt.hash(password || 'Vendor@123', 10);

      // Step 1: create vendor
      const vendor = await prisma.vendor.create({
        data: {
          name,
          email,
          password: passwordHash,
          contactNo,
          countryCode,
          serviceTypes: serviceTypes || '',
          minimumAmount,
          maximumAmount,
        },
      });

      // Step 2: Move uploaded files from vendor_temp → vendor_<id>
      const uploadedFiles: MulterFile[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files || {}).flat();

      const vendorDir = path.join(__dirname, `../../uploads/vendor_${vendor.id}`);
      if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir, { recursive: true });

      for (const file of uploadedFiles) {
        const newPath = path.join(vendorDir, file.filename);
        try {
          fs.renameSync(file.path, newPath);
          file.path = newPath;
        } catch (err) {
          console.error('Failed moving file:', file.filename, err);
        }
      }

      // Step 3: Save teams & members
      for (let tIndex = 0; tIndex < teams.length; tIndex++) {
        const team = teams[tIndex];

        const createdTeam = await prisma.team.create({
          data: {
            name: team.name || '',
            description: team.description || '',
            vendorId: vendor.id,
          },
        });

        const usedEmails = new Set<string>();
        const members = team.members || [];

        for (let mIndex = 0; mIndex < members.length; mIndex++) {
          const member = members[mIndex];
          if (!member.email || usedEmails.has(member.email)) continue;
          usedEmails.add(member.email);

          const avatarFile = uploadedFiles.find(
            (f) => f.fieldname === `teams[${tIndex}][members][${mIndex}][avatarFile]`
          );

          let avatarValue: string | null = null;
          const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
          if (avatarFile)
            avatarValue = `${SERVER_URL}/uploads/vendor_${vendor.id}/${avatarFile.filename}`;

          // Check if member already exists by email
          let teamMember = await prisma.teamMember.findUnique({ where: { email: member.email } });

          if (teamMember) {
            // Update existing member's info if needed
            await prisma.teamMember.update({
              where: { id: teamMember.id },
              data: {
                name: member.name,
                role: member.role || '',
                phone: member.phone ?? undefined,
                avatar: avatarValue ?? teamMember.avatar,
                vendorId: vendor.id, // associate with this vendor if not set
              },
            });
          } else {
            const password = generateRandomPassword();
            const passwordHash = await bcrypt.hash(password, 10);

            // Create new member
            teamMember = await prisma.teamMember.create({
              data: {
                name: member.name,
                role: member.role || '',
                email: member.email,
                phone: member.phone ?? undefined,
                avatar: avatarValue,
                password: passwordHash,
                vendorId: vendor.id,
              },
            });
          }

          // Link member to the team
          await prisma.teamMemberOnTeam.upsert({
            where: {
              teamId_teamMemberId: { teamId: createdTeam.id, teamMemberId: teamMember.id },
            },
            update: {},
            create: { teamId: createdTeam.id, teamMemberId: teamMember.id },
          });
        }
      }

      const { password: _p, ...vendorWithoutPassword } = vendor;
      return res
        .status(statusCodes.CREATED)
        .json(
          new ApiResponse(
            statusCodes.CREATED,
            vendorWithoutPassword,
            successMessages.CREATE_SUCCESS
          )
        );
    } catch (error) {
      logger.error('Error creating vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.VENDOR_CREATION_FAILED
          )
        );
    }
  }

  public async updateVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Convert amounts
      if (req.body.minimumAmount) req.body.minimumAmount = Number(req.body.minimumAmount);
      if (req.body.maximumAmount) req.body.maximumAmount = Number(req.body.maximumAmount);

      const body = req.body;
      const { teams = [], ...vendorData } = body;

      const existingVendor = await prisma.vendor.findUnique({ where: { id } });
      if (!existingVendor) return res.status(404).json({ message: 'Vendor not found' });

      // Convert isActive string to boolean
      if (typeof vendorData.isActive === 'string') {
        vendorData.isActive = vendorData.isActive.toLowerCase() === 'true';
      }

      // Hash password if provided
      if (vendorData.password) {
        const salt = await bcrypt.genSalt(10);
        vendorData.password = await bcrypt.hash(vendorData.password, salt);
      } else {
        delete vendorData.password;
      }

      // Update vendor basic info
      const vendor = await prisma.vendor.update({ where: { id }, data: vendorData });

      // Existing teams with members
      const existingTeams = await prisma.team.findMany({
        where: { vendorId: id },
        include: { teamMembers: { include: { teamMember: true } } },
      });

      const newTeamIds = teams.filter((t) => t.id && t.id !== 'temp').map((t) => t.id);
      const teamsToDelete = existingTeams.filter((team) => !newTeamIds.includes(team.id));
      const avatarsToDelete: string[] = [];

      // Delete removed teams and their members if no other links exist
      for (const team of teamsToDelete) {
        for (const tm of team.teamMembers) {
          const otherLinks = await prisma.teamMemberOnTeam.count({
            where: { teamMemberId: tm.teamMember.id },
          });
          if (otherLinks <= 1 && tm.teamMember.avatar) {
            // avatarsToDelete.push(tm.teamMember.avatar);
            // await prisma.teamMember.delete({ where: { id: tm.teamMember.id } });
          }
        }
        await prisma.cardTeam.deleteMany({ where: { teamId: team.id } });
        await prisma.team.delete({ where: { id: team.id } });
      }

      // Flatten uploaded files
      const uploadedFiles: MulterFile[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files || {}).flat();

      // Process each team
      for (let tIndex = 0; tIndex < teams.length; tIndex++) {
        const team = teams[tIndex];

        // Upsert team
        const updatedTeam =
          team.id && team.id !== 'temp'
            ? await prisma.team.upsert({
                where: { id: team.id },
                update: { name: team.name || '', description: team.description || '' },
                create: {
                  name: team.name || '',
                  description: team.description || '',
                  vendorId: id,
                },
              })
            : await prisma.team.create({
                data: { name: team.name || '', description: team.description || '', vendorId: id },
              });

        const currentTeamMembers = await prisma.teamMemberOnTeam.findMany({
          where: { teamId: updatedTeam.id },
          include: { teamMember: true },
        });

        const processedMemberIds = new Set<string>();
        const usedEmails = new Set<string>();

        const members = team.members || [];
        for (let mIndex = 0; mIndex < members.length; mIndex++) {
          const member = members[mIndex];

          if (!member.email || usedEmails.has(member.email)) continue;
          usedEmails.add(member.email);

          // Uploaded avatar
          const avatarFile = uploadedFiles.find(
            (f) => f.fieldname === `teams[${tIndex}][members][${mIndex}][avatarFile]`
          );

          // Check existing member by email
          let teamMember = await prisma.teamMember.findUnique({ where: { email: member.email } });

          let avatarValue: string | null = null;
          const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

          if (avatarFile) {
            if (teamMember?.avatar) avatarsToDelete.push(teamMember.avatar);
            avatarValue = `${SERVER_URL}/uploads/vendor_${id}/${avatarFile.filename}`;
          } else if (
            typeof member.existingAvatar === 'string' &&
            member.existingAvatar.startsWith('/uploads')
          ) {
            avatarValue = teamMember?.avatar || member.existingAvatar;
          } else {
            if (teamMember?.avatar) avatarsToDelete.push(teamMember.avatar);
            avatarValue = null;
          }

          if (teamMember) {
            // Update existing member
            teamMember = await prisma.teamMember.update({
              where: { id: teamMember.id },
              data: {
                name: member.name,
                role: member.role || '',
                phone: member.phone ?? undefined,
                avatar: avatarValue,
              },
            });
          } else {
            const password = generateRandomPassword();
            const passwordHash = await bcrypt.hash(password, 10);

            // Create new member
            teamMember = await prisma.teamMember.create({
              data: {
                name: member.name,
                role: member.role || '',
                email: member.email,
                phone: member.phone ?? undefined,
                avatar: avatarValue,
                vendorId: id,
                password: passwordHash,
              },
            });
          }

          processedMemberIds.add(teamMember.id);

          // Link member to team (upsert)
          await prisma.teamMemberOnTeam.upsert({
            where: { teamId_teamMemberId: { teamId: updatedTeam.id, teamMemberId: teamMember.id } },
            update: {},
            create: { teamId: updatedTeam.id, teamMemberId: teamMember.id },
          });
        }

        // Remove members no longer in the team
        for (const currentMember of currentTeamMembers) {
          if (!processedMemberIds.has(currentMember.teamMember.id)) {
            await prisma.teamMemberOnTeam.delete({
              where: {
                teamId_teamMemberId: {
                  teamId: updatedTeam.id,
                  teamMemberId: currentMember.teamMember.id,
                },
              },
            });

            const otherLinks = await prisma.teamMemberOnTeam.count({
              where: { teamMemberId: currentMember.teamMember.id },
            });
            if (otherLinks === 0 && currentMember.teamMember.avatar) {
              avatarsToDelete.push(currentMember.teamMember.avatar);
              await prisma.teamMember.delete({ where: { id: currentMember.teamMember.id } });
            }
          }
        }
      }

      // Delete old avatars safely
      for (const path of avatarsToDelete) {
        try {
          const count = await prisma.teamMember.count({ where: { avatar: path } });
          if (count === 0) deleteFile(path);
        } catch (err) {
          console.warn('Failed to delete avatar', path, err);
        }
      }

      const { password: _p, ...vendorWithoutPassword } = vendor;
      return res
        .status(200)
        .json({ data: vendorWithoutPassword, message: 'Vendor updated successfully' });
    } catch (err) {
      console.error('Update vendor error', err);
      return res.status(500).json({ message: 'Update failed' });
    }
  }

  public async getVendors(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || 'ALL';

      const skip = (page - 1) * limit;

      const where: any = {};

      if (status !== 'ALL') {
        where.isActive = status === 'true';
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { contactNo: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            countryCode: true,
            serviceTypes: true,
            minimumAmount: true,
            maximumAmount: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.vendor.count({ where }),
      ]);

      return res.status(200).json({
        data: vendors,
        pagination: { total, page, limit },
      });
    } catch (error) {
      logger.error('Error fetching vendors:', error);
      return res.status(500).json({
        message: 'Failed to fetch vendors',
        error,
      });
    }
  }

  public async getHomeVendors(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const serviceType = (req.query.serviceType as string) || '';
      const minPrice = parseFloat(req.query.minPrice as string) || 0;
      const maxPriceQuery = req.query.maxPrice as string;
      const maxPrice = maxPriceQuery ? parseFloat(maxPriceQuery) : undefined;

      const skip = (page - 1) * limit;

      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { contactNo: { contains: search, mode: 'insensitive' } },
          { serviceTypes: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (serviceType) {
        where.serviceTypes = { contains: serviceType, mode: 'insensitive' };
      }

      const priceFilter: any = {};
      if (!isNaN(minPrice)) priceFilter.gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) priceFilter.lte = maxPrice;

      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            countryCode: true,
            serviceTypes: true,
            minimumAmount: true,
            maximumAmount: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            vendorServices: {
              where: Object.keys(priceFilter).length ? { price: priceFilter } : {},
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                price: true,
                country: true,
                state: true,
                city: true,
                name: true,
                latitude: true,
                longitude: true,
                thumbnail: {
                  select: {
                    id: true,
                    url: true,
                  },
                },
              },
            },
          },
        }),
        prisma.vendor.count({ where }),
      ]);

      return res.status(200).json({
        data: vendors,
        pagination: { total, page, limit },
      });
    } catch (error) {
      logger.error('Error fetching home vendors:', error);
      return res.status(500).json({
        message: 'Failed to fetch vendors',
        error,
      });
    }
  }


  public async getEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const vendorId = req.userId;
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNum - 1) * pageSize;

      // Query leads
      const leads = await prisma.lead.findMany({
        where: {
          saveStatus: { not: 'ARCHIVED' },
          cards: {
            some: {
              vendorId: vendorId,
            },
          },
          ...(status ? { status: status as LeadStatus } : {}),
          ...(search
            ? {
                OR: [
                  {
                    partner1Name: {
                      contains: search as string,
                      mode: 'insensitive',
                    },
                  },
                  {
                    partner2Name: {
                      contains: search as string,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: { contains: search as string, mode: 'insensitive' },
                  },
                  {
                    phoneNumber: {
                      contains: search as string,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          createdBy: true,
          proposals: true,
          contracts: true,
          payments: true,
          cards: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  countryCode: true,
                },
              },
              cardTeams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      teamMembers: {
                        select: {
                          teamMember: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                              phone: true,
                              role: true,
                              avatar: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: pageSize,
      });

      // Count for pagination
      const totalLeads = await prisma.lead.count({
        where: {
          saveStatus: { not: 'ARCHIVED' },
          cards: { some: { vendorId } },
        },
      });

      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            data: sanitizeData(leads),
            pagination: {
              total: totalLeads,
              page: pageNum,
              pageSize,
              totalPages: Math.ceil(totalLeads / pageSize),
            },
          },
          'Vendor leads fetched successfully'
        )
      );
    } catch (error: any) {
      logger.error('❌ Error fetching vendor leads:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_FETCH_FAILED)
        );
    }
  }

  public async getVendorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vendor = await prisma.vendor.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          countryCode: true,
          serviceTypes: true,
          minimumAmount: true,
          maximumAmount: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          teams: {
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
              updatedAt: true,
              teamMembers: {
                select: {
                  teamMember: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                      email: true,
                      phone: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const transformed = transformVendor(vendor);

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, transformed, successMessages.FETCH_SUCCESS));
    } catch (error) {
      logger.error('❌ Error fetching vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.FETCH_FAILED));
    }
  }

  public async deleteVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.vendor.delete({ where: { id } });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.DELETE_SUCCESS));
    } catch (error) {
      logger.error('❌ Error deleting vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.DELETE_FAILED)
        );
    }
  }

  /**
   * 🔄 Update Vendor Status
   */
  public async updateVendorStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const vendor = await prisma.vendor.update({
        where: { id },
        data: { isActive },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, vendor, successMessages.UPDATE_SUCCESS));
    } catch (error) {
      logger.error('❌ Error updating vendor status:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.UPDATE_FAILED)
        );
    }
  }

  /**
   * 🔄 Bulk Update Vendor Status
   */
  public async bulkUpdateVendorStatus(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'No vendor IDs provided'));
      }

      // Convert status string to Boolean
      let isActive: boolean;
      if (status === 'ACTIVE') isActive = true;
      else if (status === 'INACTIVE') isActive = false;
      else
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Invalid status value'));

      const result = await prisma.vendor.updateMany({
        where: { id: { in: ids } },
        data: { isActive },
      });

      if (result.count === 0) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(statusCodes.NOT_FOUND, null, 'No vendors found for the provided IDs')
          );
      }

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { updatedCount: result.count },
            successMessages.UPDATE_SUCCESS
          )
        );
    } catch (error) {
      logger.error('❌ Error bulk updating vendor status:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.UPDATE_FAILED)
        );
    }
  }

  /**
   * 📤 Export Vendors (CSV)
   */
  public async exportVendorsWithIdsCsv(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      const vendors = await prisma.vendor.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          countryCode: true,
          serviceTypes: true,
          minimumAmount: true,
          maximumAmount: true,
          isActive: true,
        },
      });

      const parser = new Parser();
      const csv = parser.parse(vendors);

      res.header('Content-Type', 'text/csv');
      res.attachment('vendors.csv');
      return res.send(csv);
    } catch (error) {
      logger.error('❌ Error exporting vendors:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.EXPORT_FAILED)
        );
    }
  }

  /**
   * 📌 Get Leads for a Vendor
   */
  public async getLeads(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId;
      if (!vendorId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.VENDOR_ID_REQUIRED));
      }

      const vendorWithCards = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          cards: { include: { originalLead: true } },
        },
      });

      if (!vendorWithCards) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const vendors = sanitizeData(vendorWithCards);
      return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, vendors?.cards));
    } catch (error) {
      logger.error('❌ Error fetching leads:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.VENDOR_FETCH_LEAD_FAILED
          )
        );
    }
  }
}

function transformVendor(vendor: any) {
  return {
    ...vendor,
    teams: vendor.teams.map((team: any) => ({
      ...team,
      members: team.teamMembers.map((tm: any) => ({
        ...tm.teamMember,
        avatar: tm.teamMember.avatar === 'null' ? null : tm.teamMember.avatar,
      })),
    })),
  };
}
