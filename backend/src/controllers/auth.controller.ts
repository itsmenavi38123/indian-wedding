import e, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import optGenerator from 'otp-generator';
import prisma from '@/config/prisma';
import { TokenOwnerType, UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';

import { logger } from '@/logger';
import { ApiResponse } from '@/utils/ApiResponse';
import { CONST_KEYS, cookiesOption, errorMessages, statusCodes, successMessages } from '@/constant';

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { enqueuePushEmail } from '@/queues/emailQueue';
import { createVendorSchema } from '@/validators/vendor/vendorAuth';

export class AuthController {
  public async validateUser(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            userId: req.userId,
            userEmail: req.userEmail,
          },
          successMessages.API_SUCCESS
        )
      );
    } catch (error) {
      logger.error('Error validating user:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.API_ERROR));
    }
  }

  public async logout(req: AuthenticatedRequest, res: Response) {
    try {
      res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
      res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            null,
            successMessages.LOGOUT_SUCCESS || 'Logged out successfully'
          )
        );
    } catch (error) {
      logger.error('❌ Error logging out:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Logout failed'));
    }
  }

  // admin >>>>>>>>>>>>>>>>>>>
  public async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      let admin = await prisma.admin.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          countryCode: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!admin || !admin.isActive) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!isMatch) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      const payload = { id: admin.id, email: admin.email, role: admin.role };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(admin.id, rememberMe);

      await prisma.admin.update({
        where: { id: admin.id },
        data: { refreshToken },
      });

      res.cookie(CONST_KEYS.ACCESS_TOKEN, accessToken, cookiesOption(24 * 60 * 60 * 1000));
      res.cookie(
        CONST_KEYS.REFRESH_TOKEN,
        refreshToken,
        cookiesOption(rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
      );
      admin.passwordHash = '';

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, { admin }, successMessages.LOGIN_SUCCESS));
    } catch (error) {
      logger.error('❌ Error logging in:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LOGIN_FAILED));
    }
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[CONST_KEYS.REFRESH_TOKEN];
      if (!refreshToken) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      let decoded: any;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      const admin = await prisma.admin.findUnique({ where: { id: decoded.userId } });
      if (!admin || !admin.isActive || !admin.refreshToken || admin.refreshToken !== refreshToken) {
        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.USER_NOT_FOUND));
      }

      const payload = { id: admin.id, email: admin.email, role: admin.role };
      const newAccessToken = generateAccessToken(payload);

      res.cookie(CONST_KEYS.ACCESS_TOKEN, newAccessToken, cookiesOption(24 * 60 * 60 * 1000));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            {},
            successMessages.ACCESS_TOKEN_REFRESHED || 'Access token refreshed'
          )
        );
    } catch (error) {
      logger.error('❌ Error refreshing token:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Refresh token failed'));
    }
  }

  public async createAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, countryCode, phone, role } = req.body;

      const existing = await prisma.admin.findUnique({ where: { email } });
      if (existing) {
        res
          .status(statusCodes.CONFLICT)
          .json(new ApiResponse(statusCodes.CONFLICT, null, errorMessages.EMAIL_ALREADY_EXISTS));
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          passwordHash,
          countryCode,
          phone,
          role: role || UserRole.ADMIN,
        },
      });

      res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, admin, successMessages.ADMIN_CREATED));
    } catch (error) {
      logger.error('❌ Error creating admin:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.ADMIN_CREATION_FAILED
          )
        );
    }
  }

  public async sendResetEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const otp = optGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });

      await prisma.passwordResetToken.create({
        data: {
          type: 'ADMIN',
          adminId: admin.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      // enqueue email
      await enqueuePushEmail({ to: email, otp });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, { otp }, successMessages.RESET_EMAIL_SENT));
    } catch (error) {
      logger.error('❌ Error sending reset email:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.EMAIL_SEND_FAILED)
        );
    }
  }

  public async lastTimeOtpSend(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const admin = await prisma.admin.findUnique({ where: { email: email as string } });
      if (!admin) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          adminId: admin.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
        },
      });

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { sendTime: resetToken?.createdAt },
            successMessages.RESET_EMAIL_SENT
          )
        );
    } catch (error) {
      logger.error('❌ Error finding reset email otp:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.EMAIL_SEND_FAILED)
        );
    }
  }

  public async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          adminId: admin.id,
          otp,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!resetToken) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.INVALID_OR_EXPIRED_OTP)
          );
      }

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { tokenId: resetToken.id }, successMessages.OTP_VERIFIED)
        );
    } catch (error) {
      logger.error('❌ Error verifying OTP:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.OTP_VERIFY_FAILED)
        );
    }
  }

  public async resetPassword(req: Request, res: Response) {
    try {
      const { tokenId, newPassword } = req.body;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { id: tokenId },
        include: { admin: true },
      });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_OR_EXPIRED_OTP)
          );
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.$transaction(async (tx) => {
        if (resetToken.type === 'ADMIN' && resetToken.adminId) {
          await tx.admin.update({
            where: { id: resetToken.adminId },
            data: { passwordHash },
          });
        }
        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        });
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.PASSWORD_RESET_SUCCESS));
    } catch (error) {
      logger.error('❌ Error resetting password:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PASSWORD_RESET_FAILED
          )
        );
    }
  }

  public async currentAdmin(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      const existing = await prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          countryCode: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.ADMIN_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { data: existing }, successMessages.CURRENT_ADMIN_DETAILS)
        );
    } catch (error) {
      logger.error('❌ Error creating admin:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.ADMIN_NOT_FOUND)
        );
    }
  }

  // vendor >>>>>>>>>>>>>
  public async vendorLogin(req: Request, res: Response) {
    try {
      console.log(req.body, '>>vendorLogin');
      const { email, password, rememberMe } = req.body;
      const vendor = await prisma.vendor.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          contactNo: true,
          role: true,
          serviceTypes: true,
          minimumAmount: true,
          maximumAmount: true,
        },
      });
      if (!vendor) {
        res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
        return;
      }
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (!isMatch) {
        res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
        return;
      }

      const payload = { id: vendor.id, name: vendor.name, email: vendor.email, role: vendor.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(vendor.id, rememberMe);

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { refreshToken: refreshToken },
      });

      res.cookie(CONST_KEYS.ACCESS_TOKEN, accessToken, cookiesOption(24 * 60 * 60 * 1000));
      res.cookie(
        CONST_KEYS.REFRESH_TOKEN,
        refreshToken,
        cookiesOption(rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
      );
      const { password: _password, ...vendorWithoutPassword } = vendor;
      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { vendorWithoutPassword, accessToken, refreshToken },
            successMessages.LOGIN_SUCCESS
          )
        );
      return;
    } catch (error) {
      logger.error('❌ Error logging in:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LOGIN_FAILED));
    }
  }

  public async refreshTokenVendor(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[CONST_KEYS.REFRESH_TOKEN];
      if (!refreshToken) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      let decoded: any;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      const vendor = await prisma.vendor.findUnique({ where: { id: decoded.userId } });
      if (
        !vendor ||
        !vendor.isActive ||
        !vendor.refreshToken ||
        vendor.refreshToken !== refreshToken
      ) {
        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.USER_NOT_FOUND));
      }

      const payload = { id: vendor.id, email: vendor.email, role: vendor.role };
      const newAccessToken = generateAccessToken(payload);

      res.cookie(CONST_KEYS.ACCESS_TOKEN, newAccessToken, cookiesOption(24 * 60 * 60 * 1000));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            {},
            successMessages.ACCESS_TOKEN_REFRESHED || 'Access token refreshed'
          )
        );
    } catch (error) {
      logger.error('❌ Error refreshing token:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Refresh token failed'));
    }
  }

  public async registerVendor(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        password,
        contactNo,
        serviceTypes,
        minimumAmount,
        maximumAmount,
        countryCode,
      } = createVendorSchema.parse(req.body);
      if (
        !name ||
        !email ||
        !password ||
        !contactNo ||
        !serviceTypes ||
        !minimumAmount ||
        !maximumAmount ||
        !countryCode
      ) {
        res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(statusCodes.BAD_REQUEST, null, successMessages.REQUIRE_FIELD_MISSING)
          );
        return;
      }

      const user = await prisma.vendor.findUnique({
        where: { email: email },
      });
      if (user) {
        res
          .status(409)
          .send(new ApiResponse(statusCodes.CONFLICT, null, errorMessages.USER_EXISTED));
        return;
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const vendor = await prisma.vendor.create({
        data: {
          name: name,
          email: email,
          password: passwordHash,
          contactNo: contactNo,
          countryCode: countryCode,
          serviceTypes: serviceTypes,
          minimumAmount: minimumAmount,
          maximumAmount: maximumAmount,
        },
      });
      const accessToken = generateAccessToken(vendor);
      const refreshToken = generateRefreshToken(vendor.id);

      res.cookie(CONST_KEYS.ACCESS_TOKEN, accessToken, cookiesOption(24 * 60 * 60 * 1000));
      res.cookie(CONST_KEYS.REFRESH_TOKEN, refreshToken, cookiesOption(24 * 60 * 60 * 1000));
      const { password: _password, ...vendorWithoutPassword } = vendor;
      return res
        .status(statusCodes.CREATED)
        .json(
          new ApiResponse(
            statusCodes.CREATED,
            vendorWithoutPassword,
            successMessages.SIGNUP_SUCCESS
          )
        );
    } catch (error) {
      logger.error('❌ Error creating user:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.ADMIN_CREATION_FAILED
          )
        );
    }
  }

  public async sendVendorResetEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const vendor = await prisma.vendor.findUnique({ where: { email } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const otp = optGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });

      await prisma.passwordResetToken.create({
        data: {
          type: 'VENDOR',
          vendorId: vendor.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      // enqueue email
      await enqueuePushEmail({ to: email, otp });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, { otp }, successMessages.RESET_EMAIL_SENT));
    } catch (error) {
      logger.error('❌ Error sending reset email:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.EMAIL_SEND_FAILED)
        );
    }
  }

  public async lastTimeOtpSendVendor(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const vendor = await prisma.vendor.findUnique({ where: { email: email as string } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          vendorId: vendor.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
        },
      });

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { sendTime: resetToken?.createdAt },
            successMessages.RESET_EMAIL_SENT
          )
        );
    } catch (error) {
      logger.error('❌ Error finding reset email otp:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.EMAIL_SEND_FAILED)
        );
    }
  }

  public async verifyOtpVendor(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const vendor = await prisma.vendor.findUnique({ where: { email } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          vendorId: vendor.id,
          otp,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!resetToken) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.INVALID_OR_EXPIRED_OTP)
          );
      }

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { tokenId: resetToken.id }, successMessages.OTP_VERIFIED)
        );
    } catch (error) {
      logger.error('❌ Error verifying OTP:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.OTP_VERIFY_FAILED)
        );
    }
  }

  public async resetVendorPassword(req: Request, res: Response) {
    try {
      const { tokenId, newPassword } = req.body;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { id: tokenId },
        include: { vendor: true },
      });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_OR_EXPIRED_OTP)
          );
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.$transaction(async (tx) => {
        if (resetToken.type === 'VENDOR' && resetToken.vendorId) {
          await tx.admin.update({
            where: { id: resetToken.vendorId },
            data: { passwordHash },
          });
        }
        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        });
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.PASSWORD_RESET_SUCCESS));
    } catch (error) {
      logger.error('❌ Error resetting password:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PASSWORD_RESET_FAILED
          )
        );
    }
  }

  public async currentVendor(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }
      const existing = await prisma.vendor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { data: existing },
            successMessages.CURRENT_VENDOR_DETAILS
          )
        );
    } catch (error) {
      logger.error('❌ Error vendor:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.VENDOR_NOT_FOUND)
        );
    }
  }

  public async updateVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, contactNo, serviceTypes, minimumAmount, maximumAmount, countryCode } =
        req.body;

      const vendor = await prisma.vendor.findUnique({ where: { id } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      let updateData: any = { ...vendor };

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (contactNo !== undefined) updateData.contactNo = contactNo;
      if (serviceTypes !== undefined) updateData.serviceTypes = serviceTypes;
      if (minimumAmount !== undefined) updateData.minimumAmount = minimumAmount;
      if (maximumAmount !== undefined) updateData.maximumAmount = maximumAmount;
      if (countryCode !== undefined) updateData.countryCode = countryCode;

      updateData.updatedAt = new Date();

      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: updateData,
      });

      const { password, ...vendorWithoutPassword } = updatedVendor;

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            vendorWithoutPassword,
            successMessages.VENDOR_UPDATE_SUCCESS
          )
        );
    } catch (error) {
      logger.error('❌ Error updating vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.VENDOR_UPDATE_FAILED
          )
        );
    }
  }

  public async deactivateVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({ where: { id } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      await prisma.vendor.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.VENDOR_DEACTIVATE_SUCCESS));
    } catch (error) {
      logger.error('❌ Error deleting vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.VENDOR_DEACTIVATE_FAILED
          )
        );
    }
  }

  public async deleteVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({ where: { id } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.VENDOR_NOT_FOUND));
      }

      await prisma.vendor.delete({
        where: { id },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.VENDOR_DELETE_SUCCESS));
    } catch (error) {
      logger.error('❌ Error permanently deleting vendor:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.VENDOR_DELETE_FAILED
          )
        );
    }
  }

  // user >>>>>>>>>>>>>>>>>>>>>>>
  public async registerUser(req: Request, res: Response) {
    try {
      const { name, email, phone, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res
          .status(statusCodes.CONFLICT)
          .send(new ApiResponse(statusCodes.CONFLICT, null, errorMessages.USER_EXISTED));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { name, email, phone, password: hashedPassword },
      });

      const { password: _pw, ...userWithoutPassword } = newUser;

      return res
        .status(statusCodes.CREATED)
        .send(
          new ApiResponse(statusCodes.CREATED, userWithoutPassword, successMessages.SIGNUP_SUCCESS)
        );
    } catch (error) {
      console.error('Error registering user:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.USER_CREATION_FAILED
          )
        );
    }
  }

  public async userLogin(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          password: true,
          role: true,
        },
      });

      if (!user) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      const payload = { id: user.id, name: user.name, email: user.email, role: user?.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(user.id, rememberMe);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      res.cookie(CONST_KEYS.ACCESS_TOKEN, accessToken, cookiesOption(24 * 60 * 60 * 1000));
      res.cookie(
        CONST_KEYS.REFRESH_TOKEN,
        refreshToken,
        cookiesOption(rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
      );

      const { password: _pw, ...userWithoutPassword } = user;

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { user: userWithoutPassword },
            successMessages.LOGIN_SUCCESS
          )
        );
    } catch (error) {
      console.error('Error logging in:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LOGIN_FAILED));
    }
  }

  public async currentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.USER_NOT_FOUND));
      }

      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.USER_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, { data: existing }, successMessages.CURRENT_USER_DETAILS)
        );
    } catch (error) {
      logger.error('❌ Error current user:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.USER_NOT_FOUND)
        );
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, phone, password } = req.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res
          .status(statusCodes.NOT_FOUND)
          .send(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.USER_NOT_FOUND));
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (password) updateData.password = await bcrypt.hash(password, 10);

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      const { password: _pw, ...userWithoutPassword } = updated;

      return res
        .status(statusCodes.OK)
        .send(
          new ApiResponse(statusCodes.OK, userWithoutPassword, successMessages.USER_UPDATE_SUCCESS)
        );
    } catch (error) {
      console.error('Error updating user:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.USER_UPDATE_FAILED)
        );
    }
  }

  public async teamLogin(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      const member = await prisma.teamMember.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          roleLogin: true,
          isActive: true,
          vendorId: true,
          password: true,
        },
      });

      if (!member) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      if (!member.isActive) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(new ApiResponse(statusCodes.FORBIDDEN, null, 'Account is inactive'));
      }

      const isMatch = await bcrypt.compare(password, member?.password ?? '');
      if (!isMatch) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_CREDENTIALS));
      }

      const payload = {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.roleLogin,
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(member.id, rememberMe);

      await prisma.teamMember.update({
        where: { id: member.id },
        data: { refreshToken },
      });

      res.cookie(CONST_KEYS.ACCESS_TOKEN, accessToken, cookiesOption(24 * 60 * 60 * 1000));
      res.cookie(
        CONST_KEYS.REFRESH_TOKEN,
        refreshToken,
        cookiesOption(rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
      );

      // Exclude password from response
      const { password: _password, ...memberWithoutPassword } = member;

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { member: memberWithoutPassword, accessToken, refreshToken },
            'Login successful'
          )
        );
    } catch (error) {
      console.error('Error logging in team member:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Login failed'));
    }
  }

  public async refreshTokenTeamMember(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[CONST_KEYS.REFRESH_TOKEN];
      if (!refreshToken) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      let decoded: any;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.INVALID_REFRESH_TOKEN)
          );
      }

      const member = await prisma.teamMember.findUnique({ where: { id: decoded.userId } });

      if (
        !member ||
        !member.isActive ||
        !member.refreshToken ||
        member.refreshToken !== refreshToken
      ) {
        if (member?.refreshToken) {
          await prisma.teamMember.update({
            where: { id: member.id },
            data: { refreshToken: null },
          });
        }

        res.cookie(CONST_KEYS.ACCESS_TOKEN, '', cookiesOption(0));
        res.cookie(CONST_KEYS.REFRESH_TOKEN, '', cookiesOption(0));

        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, errorMessages.USER_NOT_FOUND));
      }

      const payload = {
        id: member.id,
        name: member.name,
        email: member.email,
        roleLogin: member.roleLogin,
      };
      const newAccessToken = generateAccessToken(payload);

      res.cookie(CONST_KEYS.ACCESS_TOKEN, newAccessToken, cookiesOption(24 * 60 * 60 * 1000));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            {},
            successMessages.ACCESS_TOKEN_REFRESHED || 'Access token refreshed'
          )
        );
    } catch (error) {
      console.error('❌ Error refreshing token for team member:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Refresh token failed'));
    }
  }

  public async currentTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Team member not found'));
      }

      const existing = await prisma.teamMember.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          roleLogin: true,
          isActive: true,
          vendorId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Team member not found'));
      }

      if (!existing.isActive) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(new ApiResponse(statusCodes.FORBIDDEN, null, 'Team member is inactive'));
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { data: existing },
            'Current team member details retrieved successfully'
          )
        );
    } catch (error) {
      console.error('❌ Error fetching team member:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to fetch team member')
        );
    }
  }

  public async sendResetEmailTeamMember(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const member = await prisma.teamMember.findUnique({ where: { email } });
      if (!member) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              errorMessages.TEAM_MEMBER_NOT_FOUND || 'Team member not found'
            )
          );
      }

      const otp = optGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });

      await prisma.passwordResetToken.create({
        data: {
          type: TokenOwnerType.TEAM,
          teamMemberId: member.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await enqueuePushEmail({ to: email, otp });

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { otp },
            successMessages.RESET_EMAIL_SENT || 'Reset OTP sent successfully'
          )
        );
    } catch (error) {
      logger.error('❌ Error sending team member reset email:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.EMAIL_SEND_FAILED || 'Failed to send reset email'
          )
        );
    }
  }

  public async verifyOtpTeamMember(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const member = await prisma.teamMember.findUnique({ where: { email } });
      if (!member) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              errorMessages.TEAM_MEMBER_NOT_FOUND || 'Team member not found'
            )
          );
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          teamMemberId: member.id,
          otp,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!resetToken) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              errorMessages.INVALID_OR_EXPIRED_OTP || 'Invalid or expired OTP'
            )
          );
      }

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { tokenId: resetToken.id },
            successMessages.OTP_VERIFIED || 'OTP verified successfully'
          )
        );
    } catch (error) {
      logger.error('❌ Error verifying team member OTP:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.OTP_VERIFY_FAILED || 'Failed to verify OTP'
          )
        );
    }
  }

  public async resetPasswordTeamMember(req: Request, res: Response) {
    try {
      const { tokenId, newPassword } = req.body;

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { id: tokenId },
        include: { teamMember: true },
      });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(
            new ApiResponse(
              statusCodes.UNAUTHORIZED,
              null,
              errorMessages.INVALID_OR_EXPIRED_OTP || 'Invalid or expired OTP'
            )
          );
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.$transaction(async (tx) => {
        if (resetToken.type === TokenOwnerType.TEAM && resetToken.teamMemberId) {
          await tx.teamMember.update({
            where: { id: resetToken.teamMemberId },
            data: { password: passwordHash },
          });
        }

        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        });
      });

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            null,
            successMessages.PASSWORD_RESET_SUCCESS || 'Password reset successfully'
          )
        );
    } catch (error) {
      logger.error('❌ Error resetting team member password:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PASSWORD_RESET_FAILED || 'Failed to reset password'
          )
        );
    }
  }

  public async lastTimeOtpSendTeamMember(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              errorMessages.TEAM_MEMBER_NOT_FOUND || 'Team Member not found'
            )
          );
      }

      const teamMember = await prisma.teamMember.findUnique({
        where: { email: email as string },
      });

      if (!teamMember) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              errorMessages.TEAM_MEMBER_NOT_FOUND || 'Team Member not found'
            )
          );
      }

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          teamMemberId: teamMember.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
        },
      });

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { sendTime: resetToken?.createdAt },
            successMessages.RESET_EMAIL_SENT || 'Reset email send time fetched successfully'
          )
        );
    } catch (error) {
      logger.error('❌ Error finding reset email otp for team member:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.EMAIL_SEND_FAILED || 'Failed to fetch OTP send time'
          )
        );
    }
  }
}
