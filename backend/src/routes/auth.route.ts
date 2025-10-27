import express from 'express';
import type { Router } from 'express';

import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validateMiddleware';

import {
  adminLoginSchema,
  createAdminSchema,
  emailValidatorSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '@/validators/auth/adminAuth';

import {
  createVendorSchema,
  updateVendorSchema,
  vendorLoginSchema,
} from '@/validators/vendor/vendorAuth';
import { authenticate } from '@/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';
import { createUserSchema, updateUserSchema, userLoginSchema } from '@/validators/user/userAuth';

export function authRoute(): Router {
  const controller = new AuthController();
  const router = express.Router();
  router.get('/validate/user', authenticate(), controller.validateUser.bind(controller));

  // admin routes >>>>>>>>>>>>>>>
  router.post('/admin/login', validate(adminLoginSchema), controller.login.bind(controller));
  router.post('/admin/logout', authenticate([UserRole.ADMIN]), controller.logout.bind(controller));
  router.post('/admin/refresh-token', controller.refreshToken.bind(controller));
  router.post(
    '/admin/create',
    validate(createAdminSchema),
    controller.createAdmin.bind(controller)
  );
  router.post(
    '/admin/send-reset-email',
    validate(emailValidatorSchema),
    controller.sendResetEmail.bind(controller)
  );
  router.post(
    '/admin/verify-otp',
    validate(verifyOtpSchema),
    controller.verifyOtp.bind(controller)
  );
  router.post(
    '/admin/reset-password',
    validate(resetPasswordSchema),
    controller.resetPassword.bind(controller)
  );
  router.get('/admin/last-time-otp-sent', controller.lastTimeOtpSend.bind(controller));
  router.get('/admin/me', authenticate([UserRole.ADMIN]), controller.currentAdmin.bind(controller));

  // vendor routes >>>>>>>>>>>>>>>>>>>>>>
  router.post(
    '/vendor/login',
    validate(vendorLoginSchema),
    controller.vendorLogin.bind(controller)
  );
  router.post(
    '/vendor/logout',
    authenticate([UserRole.VENDOR]),
    controller.logout.bind(controller)
  );
  router.post('/vendor/refresh-token', controller.refreshTokenVendor.bind(controller));
  router.post(
    '/vendor/signup',
    validate(createVendorSchema),
    controller.registerVendor.bind(controller)
  );
  router.get(
    '/vendor/me',
    authenticate([UserRole.VENDOR]),
    controller.currentVendor.bind(controller)
  );
  router.put(
    '/vendor/update/:id',
    validate(updateVendorSchema),
    controller.updateVendor.bind(controller)
  );
  router.post(
    '/vendor/send-reset-email',
    validate(emailValidatorSchema),
    controller.sendVendorResetEmail.bind(controller)
  );
  router.post(
    '/vendor/verify-otp',
    validate(verifyOtpSchema),
    controller.verifyOtpVendor.bind(controller)
  );
  router.post(
    '/vendor/reset-password',
    validate(resetPasswordSchema),
    controller.resetVendorPassword.bind(controller)
  );
  router.get('/vendor/last-time-otp-sent', controller.lastTimeOtpSendVendor.bind(controller));
  router.delete('/vendor/deactivate/:id', controller.deactivateVendor.bind(controller));
  router.delete('/vendor/:id', controller.deleteVendor.bind(controller));

  // user routes >>>>>>>>>>>>>>>>>>>>>>>>>
  router.post('/user/login', validate(userLoginSchema), controller.userLogin.bind(controller));
  router.post('/user/logout', authenticate([UserRole.USER]), controller.logout.bind(controller));
  router.post('/user/signup', validate(createUserSchema), controller.registerUser.bind(controller));
  router.get('/user/me', authenticate([UserRole.USER]), controller.currentUser.bind(controller));
  router.put(
    '/user/update/:id',
    validate(updateUserSchema),
    controller.updateUser.bind(controller)
  );

  router.post(
    '/team-member/login',
    validate(vendorLoginSchema),
    controller.teamLogin.bind(controller)
  );

  router.post(
    '/team-member/logout',
    authenticate([UserRole.TEAM]),
    controller.logout.bind(controller)
  );
  router.post('/team-member/refresh-token', controller.refreshTokenTeamMember.bind(controller));

  router.get(
    '/team-member/me',
    authenticate([UserRole.TEAM]),
    controller.currentTeamMember.bind(controller)
  );

  router.post(
    '/team-member/send-reset-email',
    validate(emailValidatorSchema),
    controller.sendResetEmailTeamMember.bind(controller)
  );

  router.post(
    '/team-member/verify-otp',
    validate(verifyOtpSchema),
    controller.verifyOtpTeamMember.bind(controller)
  );

  router.post(
    '/team-member/reset-password',
    validate(resetPasswordSchema),
    controller.resetPasswordTeamMember.bind(controller)
  );

  router.get(
    '/team-member/last-time-otp-sent',
    controller.lastTimeOtpSendTeamMember.bind(controller)
  );

  return router;
}
