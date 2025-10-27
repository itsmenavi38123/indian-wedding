import { statusCodes, errorMessages, successMessages } from '@/constant';
import { ApiResponse } from '@/utils/ApiResponse';
import {
  createTeamMemberSchema,
  createTeamSchema,
  updateTeamSchema,
  updateTeamMemberSchema,
  createVendorTeamsSchema,
  updateTeamWithMembersSchema,
} from '@/validators/team/createTeam';
import bcrypt from 'bcryptjs';
import { PrismaClient, TeamType } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticatedVendorRequest } from '@/middlewares/vendorAuthMiddleware';
import { logger } from '@/logger';
import { generateRandomPassword } from '@/utils/generatePassword';

const prisma = new PrismaClient();

export class VendorTeamController {
  /** TEAM CRUD */
  public async createTeam(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const parsed = createTeamSchema.safeParse({ ...req.body, vendorId });

      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              `${errorMessages.VALIDATION_FAILED}: ${errors}`
            )
          );
      }
      const vendorExists = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendorExists) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const team = await prisma.team.create({
        data: { name: parsed.data.name, description: parsed.data.description, vendorId },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, team, successMessages.TEAM_CREATED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_CREATE_FAILED)
        );
    }
  }

  public async getTeamsByVendor(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const vendorExists = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendorExists) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const { page = 1, limit = 10, search } = req.query as any;

      console.log('Query params:', req.query);

      const pageNum = Number(page) || 1;
      const limitNum = limit === 'all' ? undefined : Number(limit) || 10;

      const where: any = { vendorId };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            teamMembers: {
              some: {
                teamMember: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
          },
        ];
      }

      let teams: any[] = [];
      let total: number = 0;

      if (limit === 'all') {
        // Fetch all teams
        teams = await prisma.team.findMany({
          where,
          include: { teamMembers: { include: { teamMember: true } } },
          orderBy: { createdAt: 'desc' },
        });
        total = teams.length;
      } else {
        const skip = (Number(page) - 1) * Number(limit);
        [teams, total] = await prisma.$transaction([
          prisma.team.findMany({
            where,
            skip,
            take: Number(limit),
            include: { teamMembers: { include: { teamMember: true } } },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.team.count({ where }),
        ]);
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { teams, total, page: limit === 'all' ? 1 : page, limit },
            successMessages.TEAMS_FETCHED
          )
        );
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAMS_FETCH_FAILED)
        );
    }
  }

  public async getTeamById(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const vendorId = req.vendorId!;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamMembers: {
            include: {
              teamMember: true,
            },
          },
        },
      });

      if (!team || team.vendorId !== vendorId) {
        return res.status(404).json({
          success: false,
          message: 'Team not found',
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        data: team,
      });
    } catch (err) {
      console.error('Error fetching team by ID:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch team',
      });
    }
  }

  public async updateTeam(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const vendorId = req.vendorId!;

      const parsed = updateTeamSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              `${errorMessages.VALIDATION_FAILED}: ${errors}`
            )
          );
      }

      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team || team.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: { name: parsed.data.name, description: parsed.data.description },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, updatedTeam, successMessages.TEAM_UPDATED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_UPDATE_FAILED)
        );
    }
  }

  public async deleteTeam(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const vendorId = req.vendorId!;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { teamMembers: true },
      });
      if (!team || team.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }
      // if (team.teamMembers.length > 0) {
      //   return res
      //     .status(statusCodes.BAD_REQUEST)
      //     .json(new ApiResponse(statusCodes.BAD_REQUEST, null, `Cannot delete team with members`));
      // }
      if (team.teamMembers.length > 0) {
        await prisma.teamMember.deleteMany({
          where: { id: teamId },
        });
      }

      await prisma.team.delete({ where: { id: teamId } });
      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { deletedTeamId: teamId }, successMessages.TEAM_DELETED)
        );
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_DELETE_FAILED)
        );
    }
  }

  /** TEAM MEMBER CRUD */
  public async createTeamMember(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const parsed = createTeamMemberSchema.safeParse({ ...req.body, vendorId });

      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              `${errorMessages.VALIDATION_FAILED}: ${errors}`
            )
          );
      }

      const { name, role, avatar, email, phone, teamIds = [] } = parsed.data;

      const member = await prisma.teamMember.create({
        data: { name, role, avatar, email: email ?? '', phone, vendorId },
      });

      if (teamIds.length > 0) {
        await prisma.teamMemberOnTeam.createMany({
          data: teamIds.map((teamId) => ({ teamId, teamMemberId: member.id })),
          skipDuplicates: true,
        });
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, member, successMessages.TEAM_MEMBER_CREATED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBER_CREATE_FAILED
          )
        );
    }
  }

  public async getTeamMembersByTeam(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const { teamId } = req.params;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamMembers: {
            include: {
              teamMember: {
                include: {
                  teams: {
                    include: {
                      team: {
                        select: {
                          id: true,
                          name: true,
                          description: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!team || team.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }

      // Transform members to old response format
      const transformedMembers = team.teamMembers.map((tm) => ({
        id: tm.teamMember.id,
        name: tm.teamMember.name,
        role: tm.teamMember.role,
        avatar: tm.teamMember.avatar,
        email: tm.teamMember.email,
        phone: tm.teamMember.phone,
        assignedToThisTeamAt: tm.assignedAt,
        allTeams: tm.teamMember.teams.map((t) => ({
          id: t.team.id,
          name: t.team.name,
          description: t.team.description,
        })),
        createdAt: tm.teamMember.createdAt,
        updatedAt: tm.teamMember.updatedAt,
      }));

      const response = {
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
        },
        members: transformedMembers,
        totalMembers: transformedMembers.length,
      };

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, response, successMessages.TEAM_MEMBERS_FETCHED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBERS_FETCH_FAILED
          )
        );
    }
  }

  public async getTeamMembers(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const { page = 1, limit = 10, search } = req.query as any;

      const where: any = { vendorId };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      let members: any[] = [];
      let total = 0;

      if (limit === 'all') {
        // Fetch all members without pagination
        members = await prisma.teamMember.findMany({
          where,
          include: {
            teams: { include: { team: { select: { id: true, name: true, description: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        });
        total = members.length;
      } else {
        const skip = (Number(page) - 1) * Number(limit);
        [members, total] = await prisma.$transaction([
          prisma.teamMember.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
              teams: { include: { team: { select: { id: true, name: true, description: true } } } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.teamMember.count({ where }),
        ]);
      }

      // Transform the data like old format
      const transformedMembers = members.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        email: member.email,
        phone: member.phone,
        teams: member.teams.map((t) => ({
          id: t.team.id,
          name: t.team.name,
          description: t.team.description,
          assignedAt: t.assignedAt,
        })),
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      }));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { members: transformedMembers, total, page: limit === 'all' ? 1 : page, limit },
            successMessages.TEAM_MEMBERS_FETCHED
          )
        );
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBERS_FETCH_FAILED
          )
        );
    }
  }

  public async updateTeamMember(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamMemberId } = req.params;
      const vendorId = req.vendorId!;
      const parsed = updateTeamMemberSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              `${errorMessages.VALIDATION_FAILED}: ${errors}`
            )
          );
      }

      const { name, role, avatar, email, phone, teamIds } = parsed.data;

      const existing = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
      if (!existing || existing.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_MEMBER_NOT_FOUND));
      }

      const updated = await prisma.teamMember.update({
        where: { id: teamMemberId },
        data: { name, role, avatar, email, phone },
      });

      if (teamIds !== undefined) {
        await prisma.teamMemberOnTeam.deleteMany({ where: { teamMemberId } });
        if (teamIds.length > 0) {
          await prisma.teamMemberOnTeam.createMany({
            data: teamIds.map((teamId) => ({ teamId, teamMemberId })),
            skipDuplicates: true,
          });
        }
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, updated, successMessages.TEAM_MEMBER_UPDATED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBER_UPDATE_FAILED
          )
        );
    }
  }

  public async deleteTeamMember(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamMemberId } = req.params;
      const vendorId = req.vendorId!;

      const existing = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
      if (!existing || existing.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_MEMBER_NOT_FOUND));
      }

      await prisma.$transaction([
        prisma.teamMemberOnTeam.deleteMany({ where: { teamMemberId } }),
        prisma.teamMember.delete({ where: { id: teamMemberId } }),
      ]);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { deletedMemberId: teamMemberId },
            successMessages.TEAM_MEMBER_DELETED
          )
        );
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBER_DELETE_FAILED
          )
        );
    }
  }

  public async updateTeamWithMembers(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const vendorId = req.vendorId!;

      const parsed = updateTeamWithMembersSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              `${errorMessages.VALIDATION_FAILED}: ${errors}`
            )
          );
      }

      const { name, description, members = [] } = parsed.data;
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamMembers: {
            include: { teamMember: true },
          },
        },
      });

      if (!team || team.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: { name, description },
      });
      const existingMembers = team.teamMembers.map((tm) => tm.teamMember);
      const membersToRemove = existingMembers.filter(
        (em) => !members.find((m) => m.email === em.email)
      );
      if (membersToRemove.length > 0) {
        await prisma.teamMemberOnTeam.deleteMany({
          where: {
            teamMemberId: { in: membersToRemove.map((m) => m.id) },
            teamId,
          },
        });
      }
      for (const memberData of members) {
        let member = await prisma.teamMember.findUnique({
          where: { email: memberData.email },
        });

        if (member) {
          if (member.name !== memberData.name) {
            await prisma.teamMember.update({
              where: { id: member.id },
              data: { name: memberData.name },
            });
          }

          const alreadyLinked = await prisma.teamMemberOnTeam.findFirst({
            where: { teamId, teamMemberId: member.id },
          });

          if (!alreadyLinked) {
            await prisma.teamMemberOnTeam.create({
              data: { teamId, teamMemberId: member.id },
            });
          }
        } else {
          const password = generateRandomPassword();
          const passwordHash = await bcrypt.hash(password, 10);

          const newMember = await prisma.teamMember.create({
            data: {
              name: memberData.name,
              email: memberData.email,
              password: passwordHash,
              vendorId,
            },
          });

          await prisma.teamMemberOnTeam.create({
            data: { teamId, teamMemberId: newMember.id },
          });
        }
      }
      const teamWithMembers = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamMembers: {
            include: { teamMember: true },
          },
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, teamWithMembers, successMessages.TEAM_UPDATED));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_UPDATE_FAILED)
        );
    }
  }

  /** NEW: Assign member to teams */
  public async assignMemberToTeam(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const { teamMemberId, teamIds } = req.body;

      const member = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
      if (!member || member.vendorId !== vendorId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_MEMBER_NOT_FOUND));
      }

      // Remove old assignments
      await prisma.teamMemberOnTeam.deleteMany({ where: { teamMemberId } });

      // Assign new teams
      if (teamIds && teamIds.length > 0) {
        await prisma.teamMemberOnTeam.createMany({
          data: teamIds.map((teamId: string) => ({ teamId, teamMemberId })),
          skipDuplicates: true,
        });
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { teamMemberId, assignedTeams: teamIds },
            successMessages.TEAM_MEMBER_ASSIGNED
          )
        );
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEAM_MEMBER_ASSIGN_FAILED
          )
        );
    }
  }

  //   Add multiple Teams
  public async createVendorTeams(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const vendorId = req.vendorId!;
      const parsed = createVendorTeamsSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => e.message).join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, `Validation failed: ${errors}`));
      }

      const { teams } = parsed.data;

      const result = await prisma.$transaction(async (prisma) => {
        const createdTeams: any[] = [];

        for (const teamData of teams) {
          const team = await prisma.team.create({
            data: {
              name: teamData.name,
              description: teamData.description,
              type: TeamType.EXTERNAL,
              vendor: {
                connect: { id: vendorId },
              },
            },
          });

          const membersInTeam: any[] = [];

          if (teamData.members && teamData.members.length > 0) {
            for (const memberData of teamData.members) {
              let member = await prisma.teamMember.findUnique({
                where: { email: memberData.email },
                select: {
                  id: true,
                  name: true,
                  roleLogin: true,
                  role: true,
                  avatar: true,
                  email: true,
                  phone: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true,
                  adminId: true,
                },
              });

              if (!member) {
                const password = generateRandomPassword();
                const passwordHash = await bcrypt.hash(password, 10);

                member = await prisma.teamMember.create({
                  data: {
                    name: memberData.name,
                    password: passwordHash,
                    email: memberData.email,
                    vendorId,
                  },
                  select: {
                    id: true,
                    name: true,
                    roleLogin: true,
                    role: true,
                    avatar: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    adminId: true,
                  },
                });
              } else {
                await prisma.teamMember.update({
                  where: { id: member.id },
                  data: {
                    name: memberData.name || member.name,
                  },
                });
              }

              const existingLink = await prisma.teamMemberOnTeam.findFirst({
                where: {
                  teamId: team.id,
                  teamMemberId: member.id,
                },
              });

              if (!existingLink) {
                await prisma.teamMemberOnTeam.create({
                  data: { teamId: team.id, teamMemberId: member.id },
                });
              }

              membersInTeam.push(member);
            }
          }

          createdTeams.push({ ...team, members: membersInTeam });
        }
        return createdTeams;
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, result, 'Teams and members created successfully!'));
    } catch (error) {
      console.error(error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to create teams and members'
          )
        );
    }
  }
}
