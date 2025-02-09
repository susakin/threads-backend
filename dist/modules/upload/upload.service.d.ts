/// <reference types="multer" />
export declare class UploadService {
    create(file: Express.Multer.File): Promise<unknown>;
    private compressImageQuality;
    compressVideoQuality(filePath: string, quality: number): Promise<void>;
}
