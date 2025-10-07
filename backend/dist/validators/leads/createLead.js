"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadSchema = void 0;
const zod_1 = require("zod");
exports.createLeadSchema = zod_1.z.object({
    partner1Name: zod_1.z.string().min(1, "Partner 1 name is required"),
    partner2Name: zod_1.z.string().optional(),
    primaryContact: zod_1.z.string().min(1, "Primary contact is required"),
    phoneNumber: zod_1.z.string().min(5, "Phone number is required"),
    whatsappNumber: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    weddingDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid wedding date",
    }),
    flexibleDates: zod_1.z.boolean().optional(),
    guestCount: zod_1.z.number().optional(),
    budgetMin: zod_1.z.number(),
    budgetMax: zod_1.z.number(),
    preferredLocations: zod_1.z.array(zod_1.z.string()).optional(),
    leadSource: zod_1.z.string(),
    referralDetails: zod_1.z.string().optional(),
    initialNotes: zod_1.z.string().optional(),
    createdById: zod_1.z.string().uuid().optional(),
});
