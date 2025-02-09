"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const sizeOf = require("image-size");
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
ffmpeg.setFfprobePath(ffprobePath);
const { exec } = require('child_process');
let UploadService = class UploadService {
    async create(file) {
        if (!file) {
            throw new Error('file type is not allowed');
        }
        const fileInfo = {
            url: `/uploads/${file.filename}`,
            width: null,
            height: null,
            type: '',
        };
        if (file.mimetype.includes('image')) {
            const fileSizeInKB = file.size / 1024;
            const shouldCompress = fileSizeInKB > 300;
            const ratio = shouldCompress ? 0.5 : 1;
            const dimensions = sizeOf.imageSize(file.path);
            const { orientation, width, height } = dimensions;
            if (orientation === 6 || orientation === 8) {
                fileInfo.width = height * ratio;
                fileInfo.height = width * ratio;
            }
            else {
                fileInfo.width = width * ratio;
                fileInfo.height = height * ratio;
            }
            fileInfo.type = 'image';
            shouldCompress && this.compressImageQuality(file.path, 60);
        }
        else if (file.mimetype.includes('video')) {
            fileInfo.type = 'video';
            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(file.path, (err, metadata) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        fileInfo.width =
                            metadata.streams[0].width || metadata.streams?.[1]?.width;
                        fileInfo.height =
                            metadata.streams[0].height || metadata.streams?.[1]?.height;
                        resolve(fileInfo);
                    }
                });
            });
        }
        return fileInfo;
    }
    compressImageQuality(filePath, quality) {
        return new Promise((resolve, reject) => {
            try {
                exec(`convert ${filePath} -resize 50% -quality ${quality} ${filePath}`, (error, stdout, stderr) => {
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    resolve();
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    compressVideoQuality(filePath, quality) {
        return new Promise((resolve, reject) => {
            try {
                exec(`ffmpeg -i ${filePath} -vf "scale=iw*${quality}:ih*${quality}" -crf 23 -y ${filePath}`, (error, stdout, stderr) => {
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map