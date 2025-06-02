"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContentType = exports.validateExecutionRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const executionSchema = joi_1.default.object({
    language: joi_1.default.string().valid('javascript', 'python').required(),
    code: joi_1.default.string().min(1).max(100000).required(),
    input: joi_1.default.string().max(10000).optional(),
    timeout: joi_1.default.number().integer().min(1000).max(10000).optional(),
});
const validateExecutionRequest = (req, res, next) => {
    const { error, value } = executionSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: error.details[0].message,
            timestamp: Date.now(),
        });
        return;
    }
    req.body = {
        language: value.language,
        code: value.code.trim(),
        input: value.input ? value.input.trim() : '',
        timeout: value.timeout || 5000,
    };
    next();
};
exports.validateExecutionRequest = validateExecutionRequest;
const validateContentType = (req, res, next) => {
    if (req.method !== 'GET' && !req.is('application/json')) {
        res.status(400).json({
            success: false,
            error: 'Invalid content type',
            message: 'Content-Type must be application/json',
            timestamp: Date.now(),
        });
        return;
    }
    next();
};
exports.validateContentType = validateContentType;
//# sourceMappingURL=validation.js.map