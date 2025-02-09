"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const path_1 = require("path");
const multer_1 = require("multer");
const short_unique_id_1 = require("short-unique-id");
const uuid = new short_unique_id_1.default({ length: 11 });
exports.multerConfig = {
    limits: {
        fileSize: 1024 * 1024 * 200,
    },
    fileFilter: (_req, file, cb) => {
        return cb(null, file.mimetype.match(/image\/(jpeg|png|gif)|video\/(mp4|quicktime)$/));
    },
    storage: (0, multer_1.diskStorage)({
        destination: 'uploads/',
        filename: (_req, file, cb) => {
            const suffix = (0, path_1.extname)(file.originalname);
            return cb(null, `${uuid.rnd()}${suffix}`);
        },
    }),
};
//# sourceMappingURL=multerConfig.js.map