import { Injectable } from '@nestjs/common';
import * as sizeOf from 'image-size';
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
ffmpeg.setFfprobePath(ffprobePath);
const { exec } = require('child_process');

@Injectable()
export class UploadService {
  async create(file: Express.Multer.File) {
    if (!file) {
      throw new Error('file type is not allowed');
    }
    const fileInfo = {
      //url: `http://192.168.1.4:3000/uploads/${file.filename}`,
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
      } else {
        fileInfo.width = width * ratio;
        fileInfo.height = height * ratio;
      }
      fileInfo.type = 'image';
      shouldCompress && this.compressImageQuality(file.path, 60);
    } else if (file.mimetype.includes('video')) {
      fileInfo.type = 'video';
      //this.compressVideoQuality(file.path, 0.5);
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file.path, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
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

  private compressImageQuality(
    filePath: string,
    quality: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        exec(
          `convert ${filePath} -resize 50% -quality ${quality} ${filePath}`,
          (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            resolve();
          },
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  public compressVideoQuality(
    filePath: string,
    quality: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        exec(
          `ffmpeg -i ${filePath} -vf "scale=iw*${quality}:ih*${quality}" -crf 23 -y ${filePath}`,
          (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            if (error !== null) {
              console.log(`exec error: ${error}`);
              reject(error);
            } else {
              resolve();
            }
          },
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}
