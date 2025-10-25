import { Response } from 'express';
import prisma from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { errorMessages, statusCodes, successMessages } from '@/constant';
import { ApiResponse } from '@/utils/ApiResponse';
import {
  createAdminTeamSchema,
  createTeamMemberSchema,
  createVendorTeamsSchema,
  updateTeamMemberSchema,
  updateTeamSchema,
  updateTeamWithMembersSchema,
} from '@/validators/team/createTeam';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { TeamType } from '@prisma/client';
import { generateRandomPassword } from '@/utils/generatePassword';

export class AdminController {
  public async createTeamAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
      const parsed = createAdminTeamSchema.safeParse({ ...req.body, adminId });

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

      const adminExists = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!adminExists) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const team = await prisma.team.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          type: TeamType.INTERNAL,
          adminId,
        },
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

  public async getTeamsByAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
      const adminExists = await prisma.admin.findUnique({ where: { id: adminId } });

      if (!adminExists) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const { page = 1, limit = 10, search } = req.query as any;

      const pageNum = Number(page) || 1;
      const limitNum = limit === 'all' ? undefined : Number(limit) || 10;

      const where: any = { adminId };
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

  public async getTeamByIdAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const adminId = req.adminId!;

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

      if (!team || team.adminId !== adminId) {
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
      console.error('Error fetching team by ID (admin):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch team',
      });
    }
  }

  public async updateTeamAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const adminId = req.adminId!;

      // Validate request body
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

      // Check if team exists and belongs to this admin
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team || team.adminId !== adminId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }

      // Update team
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

  public async deleteTeamAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const adminId = req.adminId!;

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { teamMembers: true },
      });

      if (!team || team.adminId !== adminId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }

      if (team.teamMembers.length > 0) {
        await prisma.teamMemberOnTeam.deleteMany({
          where: { teamId },
        });
      }
      await prisma.team.delete({ where: { id: teamId } });

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { deletedTeamId: teamId }, successMessages.TEAM_DELETED)
        );
    } catch (error) {
      console.error('Error deleting team (admin):', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_DELETE_FAILED)
        );
    }
  }

  public async createAdminTeams(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
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
              type: TeamType.INTERNAL,
              admin: { connect: { id: adminId } },
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
                    adminId: adminId,
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
                if (member.adminId && member.adminId !== adminId) {
                  throw new Error(`Team member ${member.email} belongs to another admin`);
                }

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

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, result, 'Teams and members created/linked successfully!')
        );
    } catch (error) {
      console.error('Error creating admin teams:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to create or link teams and members'
          )
        );
    }
  }

  public async updateTeamWithMembersAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const adminId = req.adminId!;

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
          teamMembers: { include: { teamMember: true } },
        },
      });

      if (!team) {
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
              adminId,
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
          teamMembers: { include: { teamMember: true } },
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, teamWithMembers, successMessages.TEAM_UPDATED));
    } catch (error) {
      console.error('Error updating admin team with members:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.TEAM_UPDATE_FAILED)
        );
    }
  }

  public async createTeamMemberAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
      const parsed = createTeamMemberSchema.safeParse(req.body);

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
        data: {
          name,
          role,
          avatar,
          email: email ?? '',
          phone,
          adminId,
          vendorId: '',
        },
      });

      if (teamIds.length > 0) {
        await prisma.teamMemberOnTeam.createMany({
          data: teamIds.map((teamId) => ({
            teamId,
            teamMemberId: member.id,
          })),
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

  public async getTeamMembersAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
      const { page = 1, limit = 10, search } = req.query as any;

      const where: any = { adminId };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      let members: any[] = [];
      let total = 0;

      if (limit === 'all') {
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

      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            members: transformedMembers,
            total,
            page: limit === 'all' ? 1 : page,
            limit,
          },
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

  public async updateTeamMemberAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamMemberId } = req.params;
      const adminId = req.adminId!;

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
      if (!existing || existing.adminId !== adminId) {
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

  public async deleteTeamMemberAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamMemberId } = req.params;
      const adminId = req.adminId!;

      const existing = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
      if (!existing || existing.adminId !== adminId) {
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

  public async getTeamMembersByTeamAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId!;
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
                          adminId: true,
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

      if (!team || team.adminId !== adminId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEAM_NOT_FOUND));
      }

      const transformedMembers = team.teamMembers.map((tm) => ({
        id: tm.teamMember.id,
        name: tm.teamMember.name,
        role: tm.teamMember.role,
        avatar: tm.teamMember.avatar,
        email: tm.teamMember.email,
        phone: tm.teamMember.phone,
        assignedToThisTeamAt: tm.assignedAt,
        allTeams: tm.teamMember.teams
          .filter((t) => t.team.adminId === adminId)
          .map((t) => ({
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
}
