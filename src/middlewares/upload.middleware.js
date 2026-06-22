"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
if (!fs_1.default.existsSync(env_1.env.UPLOAD_DIR)) {
    fs_1.default.mkdirSync(env_1.env.UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, callback) => callback(null, env_1.env.UPLOAD_DIR),
    filename: (_req, file, callback) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        callback(null, `${(0, crypto_1.randomUUID)()}-${safeName}`);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const allowed = new Map([
            ['.pdf', ['application/pdf']],
            ['.doc', ['application/msword']],
            ['.docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
            ['.txt', ['text/plain']],
            ['.csv', ['text/csv', 'application/vnd.ms-excel']],
            ['.md', ['text/markdown', 'text/plain']]
        ]);
        const extension = path_1.default.extname(file.originalname).toLowerCase();
        const validMimeTypes = allowed.get(extension);
        if (!validMimeTypes?.includes(file.mimetype))
            return callback(new Error('Unsupported document type'));
        callback(null, true);
    }
});
