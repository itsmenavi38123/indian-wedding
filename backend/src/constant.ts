export const CONST_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

export const cookiesOption = (maxAge: number) => ({
  httpOnly: true,
  //  secure: process.env.NODE_ENV === 'production','
  secure: false,
  sameSite: 'lax' as const,
  maxAge: maxAge,
});

export const statusCodes = {
  // General
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const errorMessages = {
  // auth:
  API_ERROR: 'Validation failure',
  INVALID_CREDENTIALS: 'Invalid email or password',
  LOGIN_FAILED: 'Login failed, please try again',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  ADMIN_CREATION_FAILED: 'Failed to create admin',
  ADMIN_NOT_FOUND: 'No admin account found with this email address.',
  EMAIL_SEND_FAILED: 'Failed to send email',
  INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
  OTP_VERIFY_FAILED: 'Failed to verify OTP',
  PASSWORD_RESET_FAILED: 'Failed to reset password',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  USER_NOT_FOUND: 'User not found',

  USER_CREATION_FAILED: 'Failed to create user',
  USER_UPDATE_FAILED: 'Failed to update user',

  USER_EXISTED: 'User already exists',
  REQUIRE_FIELD_MISSING: 'Required field is missing',

  //Leads:
  LEAD_NOT_FOUND: 'Lead not found',
  LEAD_CREATION_FAILED: 'Failed to create lead',
  LEAD_UPDATE_FAILED: 'Failed to update lead',
  LEAD_FETCH_FAILED: 'Failed to fetch lead',
  LEAD_STATUS_UPDATE_FAILED: 'Failed to update lead status',
  LEAD_ARCHIVE_FAILED: 'Failed to archive lead',
  LEAD_RESTORE_FAILED: 'Failed to restore archived lead',

  //Kanban
  KANBAN_LEAD_CREATION_FAILED: 'Failed to create kanban lead',
  KANBAN_BOARDS_FETCH_FAILED: 'Failed to fetch kanban boards',
  KANBAN_CARD_UPDATE_FAILED: 'Failed to update kanban card',
  KANBAN_CARD_DELETE_FAILED: 'Failed to delete kanban card',
  KANBAN_CARD_STATUS_UPDATE_FAILED: 'Failed to update kanban card status',

  //Pipeline
  PIPELINE_LEAD_UPDATE_FAILED: 'Failed to update lead',
  PIPELINE_LEADS_FETCH_FAILED: 'Failed to fetch pipeline leads',
  PIPELINE_LEAD_STATUS_UPDATE_FAILED: 'Failed to update lead stage',
  PIPELINE_LEAD_ARCHIVE_FAILED: 'Failed to archive lead',
  INVALID_STATUS_VALUE: 'Invalid status value',

  //Proposal Template
  TEMPLATE_NOT_FOUND: 'Template not found',
  TEMPLATE_CREATE_FAILED: 'Failed to create template',
  TEMPLATE_UPDATE_FAILED: 'Failed to update template',
  TEMPLATE_DELETE_FAILED: 'Failed to delete template',
  TEMPLATES_FETCH_FAILED: 'Failed to fetch templates',
  TEMPLATE_SEED_FAILED: 'Failed to seed templates',
  CANNOT_MODIFY_SYSTEM_TEMPLATE: 'Cannot modify system templates',
  CANNOT_DELETE_SYSTEM_TEMPLATE: 'Cannot delete system templates',

  //Wedding Package
  PACKAGE_NOT_FOUND: 'Wedding package not found',
  PACKAGE_CREATE_FAILED: 'Failed to create wedding package',
  PACKAGE_UPDATE_FAILED: 'Failed to update wedding package',
  PACKAGE_DELETE_FAILED: 'Failed to delete wedding package',
  PACKAGES_FETCH_FAILED: 'Failed to fetch wedding packages',

  //Proposal
  PROPOSAL_DRAFT_SAVE_FAILED: 'Failed to save proposal draft',
  PROPOSAL_DRAFT_FETCH_FAILED: 'Failed to fetch proposal draft',
  PROPOSAL_VERSION_SAVE_FAILED: 'Failed to save proposal version',
  PROPOSAL_FINALIZE_FAILED: 'Failed to finalize proposal',
  PROPOSAL_NOT_FOUND: 'Proposal not found',
  PROPOSAL_FETCH_FAILED: 'Failed to fetch proposal',
  PROPOSALS_FETCH_FAILED: 'Failed to fetch proposals',

  //Vendor Team
  VENDOR_NOT_FOUND: 'Vendor not found',
  TEAM_NOT_FOUND: 'Team not found',
  TEAM_CREATE_FAILED: 'Failed to create team',
  TEAM_UPDATE_FAILED: 'Failed to update team',
  TEAM_DELETE_FAILED: 'Failed to delete team',
  TEAM_HAS_MEMBERS: 'Cannot delete team with existing members',
  TEAMS_FETCH_FAILED: 'Failed to fetch teams',
  TEAM_MEMBER_CREATE_FAILED: 'Failed to create team member',
  TEAM_MEMBER_UPDATE_FAILED: 'Failed to update team member',
  TEAM_MEMBER_DELETE_FAILED: 'Failed to delete team member',
  TEAM_MEMBERS_FETCH_FAILED: 'Failed to fetch team members',
  TEAM_MEMBER_NOT_FOUND: 'Team member not found',
  TEAM_ID_REQUIRED: 'Team ID is required',
  TEAM_MEMBER_ID_REQUIRED: 'Team member ID is required',
  VENDOR_ID_REQUIRED: 'Vendor ID is required',
  VENDOR_CREATION_FAILED: 'Failed to create vendor',
  VENDOR_UPDATE_FAILED: 'Failed to update vendor',
  VALIDATION_FAILED: 'Validation failed',
  NOT_AUTHORIZED_UPDATE_TEAM: 'You are not authorized to update this team',
  NOT_AUTHORIZED_DELETE_TEAM: 'You are not authorized to delete this team',
  NOT_AUTHORIZED_UPDATE_TEAM_MEMBER: 'You are not authorized to update this team member',
  NOT_AUTHORIZED_DELETE_TEAM_MEMBER: 'You are not authorized to delete this team member',
  NOT_AUTHORIZED_VIEW_TEAM_MEMBERS: 'You are not authorized to view members of this team',
  INVALID_TEAM_IDS: 'Invalid teamIds',
  VENDOR_DEACTIVATE_FAILED: 'Failed to deactivate vendor',
  VENDOR_DELETE_FAILED: 'Failed to delete vendor',
  VENDOR_FETCH_LEAD_FAILED: 'Failed to fetch vendor leads',
  UPDATE_FAILED: 'Error updating vendor.',
  DELETE_FAILED: 'Error deleting vendor.',
  FETCH_FAILED: 'Error fetching data.',
  EXPORT_FAILED: 'Error exporting CSV.',
  TEAM_MEMBER_ASSIGN_FAILED: 'Failed to assign team member to team(s)',

  //service
  SERVICE_NOT_FOUND: 'Vendor service not found',
  SERVICE_CREATE_FAILED: 'Failed to create service',
  SERVICE_UPDATE_FAILED: 'Failed to update service',
  SERVICE_DELETE_FAILED: 'Failed to delete service',
  SERVICE_FETCH_FAILED: 'Failed to fetch service',
  SERVICES_FETCH_FAILED: 'Failed to fetch services',
  MEDIA_UPLOAD_FAILED: 'Failed to upload media',
  MEDIA_DELETE_FAILED: 'Failed to delete media',
};

export const successMessages = {
  // auth:
  API_SUCCESS: 'Validation successful',
  LOGIN_SUCCESS: 'Login successful',
  ADMIN_CREATED: 'Admin created successfully',
  RESET_EMAIL_SENT: `We've sent you a verification code. Please check your email.`,
  OTP_VERIFIED: 'OTP verified successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  CURRENT_ADMIN_DETAILS: 'Current admin details fetched successfully',
  LOGOUT_SUCCESS: 'Logout successful',
  ACCESS_TOKEN_REFRESHED: 'Access token refreshed successfully',

  // user signup
  USER_SIGNUP_SUCCESS: 'User registered successfully',
  USER_UPDATE_SUCCESS: 'User updated successfully',
  REQUIRE_FIELD_MISSING: 'Require field is missing',
  CURRENT_USER_DETAILS: 'Current user details fetched successfully',

  //vendor signup
  SIGNUP_SUCCESS: 'Vendor created successsfully',

  //Leads:
  LEAD_CREATED: 'Lead created successfully',
  LEAD_UPDATED: 'Lead updated successfully',
  LEAD_FETCHED: 'Lead fetched successfully',
  LEADS_FETCHED: 'Leads fetched successfully',
  LEAD_STATUS_UPDATED: 'Lead status updated successfully',
  LEAD_ARCHIVED: 'Lead archived successfully',
  LEAD_RESTORED: 'Lead restored successfully',

  //Kanban
  KANBAN_LEAD_CREATED: 'Kanban lead created successfully',
  KANBAN_BOARDS_FETCHED: 'Kanban boards fetched successfully',
  KANBAN_CARD_UPDATED: 'Kanban card updated successfully',
  KANBAN_CARD_DELETED: 'Kanban card deleted successfully',
  KANBAN_CARD_STATUS_UPDATED: 'Kanban card status updated successfully',

  //Pipeline
  PIPELINE_LEAD_UPDATED: 'Lead updated successfully',
  PIPELINE_LEADS_FETCHED: 'Pipeline leads fetched successfully',
  PIPELINE_LEAD_STATUS_UPDATED: 'Lead status updated successfully',
  PIPELINE_LEAD_ARCHIVED: 'Lead archived successfully',

  //Proposal Template
  TEMPLATE_CREATED: 'Template created successfully',
  TEMPLATE_UPDATED: 'Template updated successfully',
  TEMPLATE_DELETED: 'Template deleted successfully',
  TEMPLATE_FETCHED: 'Template fetched successfully',
  TEMPLATES_FETCHED: 'Templates fetched successfully',
  TEMPLATES_SEEDED: 'Default templates seeded successfully',

  //Wedding Package
  PACKAGE_CREATED: 'Wedding package created successfully',
  PACKAGE_UPDATED: 'Wedding package updated successfully',
  PACKAGE_DELETED: 'Wedding package deleted successfully',
  PACKAGES_FETCHED: 'Wedding packages fetched successfully',

  //Proposal
  PROPOSAL_DRAFT_SAVED: 'Proposal draft saved successfully',
  PROPOSAL_DRAFT_FETCHED: 'Proposal draft fetched successfully',
  PROPOSAL_VERSION_SAVED: 'Proposal version saved successfully',
  PROPOSAL_FINALIZED: 'Proposal finalized successfully',
  PROPOSAL_FETCHED: 'Proposal fetched successfully',
  PROPOSALS_FETCHED: 'Proposals fetched successfully',

  //Vendor Team
  TEAM_CREATED: 'Team created successfully',
  TEAM_UPDATED: 'Team updated successfully',
  TEAM_DELETED: 'Team deleted successfully',
  TEAMS_FETCHED: 'Teams fetched successfully',
  TEAM_MEMBER_CREATED: 'Team member created successfully',
  TEAM_MEMBER_UPDATED: 'Team member updated successfully',
  TEAM_MEMBER_DELETED: 'Team member deleted successfully',
  TEAM_MEMBERS_FETCHED: 'Team members fetched successfully',
  VENDOR_UPDATE_SUCCESS: 'Vendor update successful',
  VENDOR_DEACTIVATE_SUCCESS: 'Vendor deactivated successfully',
  VENDOR_DELETE_SUCCESS: 'Vendor deleted successfully',
  CURRENT_VENDOR_DETAILS: 'Current Vendor details fetched successfully',

  CREATE_SUCCESS: 'Vendor created successfully.',
  UPDATE_SUCCESS: 'Vendor updated successfully.',
  DELETE_SUCCESS: 'Vendor deleted successfully.',
  FETCH_SUCCESS: 'Data fetched successfully.',
  TEAM_MEMBER_ASSIGNED: 'Team member assigned to team(s) successfully',

  //service
  SERVICE_CREATED: 'Service created successfully',
  SERVICE_UPDATED: 'Service updated successfully',
  SERVICE_DELETED: 'Service deleted successfully',
  SERVICE_FETCHED: 'Service fetched successfully',
  SERVICES_FETCHED: 'Services fetched successfully',
  MEDIA_UPLOADED: 'Media uploaded successfully',
  MEDIA_DELETED: 'Media deleted successfully',
};
