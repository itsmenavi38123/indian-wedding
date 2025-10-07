"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../logger");
class LeadController {
    createLead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedData = req.body;
                const lead = yield prisma_1.default.lead.create({
                    data: Object.assign(Object.assign({}, parsedData), { weddingDate: new Date(parsedData.weddingDate) }),
                });
                res
                    .status(201)
                    .json(new ApiResponse_1.ApiResponse(201, lead, "Lead created successfully"));
            }
            catch (error) {
                // if (error instanceof ZodError) {
                //   res
                //     .status(400)
                //     .json(
                //       new ApiResponse(
                //         400,
                //         null,
                //         error.errors.map((e) => e.message).join(", ")
                //       )
                //     );
                //   return;
                // }
                logger_1.logger.error("Error creating lead:", error);
                res.status(500).json(new ApiResponse_1.ApiResponse(500, null, "Failed to create lead"));
            }
        });
    }
    getLeads(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "25", sortBy = "createdAt", sortOrder = "desc", status, search, } = req.query;
                const skip = (Number(page) - 1) * Number(limit);
                const where = {};
                if (status)
                    where.status = String(status).toUpperCase();
                if (search) {
                    where.OR = [
                        { partner1Name: { contains: String(search), mode: "insensitive" } },
                        { partner2Name: { contains: String(search), mode: "insensitive" } },
                        { email: { contains: String(search), mode: "insensitive" } },
                        { phoneNumber: { contains: String(search), mode: "insensitive" } },
                    ];
                }
                const [data, total] = yield Promise.all([
                    prisma_1.default.lead.findMany({
                        where,
                        skip,
                        take: Number(limit),
                        orderBy: { [String(sortBy)]: sortOrder === "asc" ? "asc" : "desc" },
                        include: { createdBy: true },
                    }),
                    prisma_1.default.lead.count({ where }),
                ]);
                res.status(200).json(new ApiResponse_1.ApiResponse(200, {
                    data,
                    pagination: {
                        total,
                        page: Number(page),
                        limit: Number(limit),
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                }));
            }
            catch (error) {
                logger_1.logger.error("❌ Error fetching leads:", error);
                res.status(500).json(new ApiResponse_1.ApiResponse(500, null, "Failed to fetch leads"));
            }
        });
    }
    getLeadById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { id } = req.params;
                const lead = yield prisma_1.default.lead.findUnique({
                    where: { id },
                    include: {
                        createdBy: true,
                        proposals: true,
                        contracts: true,
                        payments: true,
                    },
                });
                if (!lead) {
                    throw new ApiError_1.ApiError(404, "Lead not found");
                }
                res.status(200).json(new ApiResponse_1.ApiResponse(200, lead));
            }
            catch (error) {
                if (error instanceof ApiError_1.ApiError) {
                    res.status((_a = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _a !== void 0 ? _a : 500).json(new ApiResponse_1.ApiResponse((_b = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _b !== void 0 ? _b : 500, null, (_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : "An error occurred"));
                    return;
                }
                logger_1.logger.error("❌ Error fetching lead:", error);
                res.status(500).json(new ApiResponse_1.ApiResponse(500, null, "Failed to fetch lead"));
            }
        });
    }
    updateLead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const data = req.body;
                const updatedLead = yield prisma_1.default.lead.update({
                    where: { id },
                    data,
                });
                res
                    .status(200)
                    .json(new ApiResponse_1.ApiResponse(200, updatedLead, "Lead updated successfully"));
            }
            catch (error) {
                logger_1.logger.error("Error updating lead:", error);
                res.status(500).json(new ApiResponse_1.ApiResponse(500, null, "Failed to update lead"));
            }
        });
    }
}
exports.LeadController = LeadController;
