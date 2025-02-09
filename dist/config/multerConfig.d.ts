/// <reference types="multer" />
export declare const multerConfig: {
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => any;
    storage: import("multer").StorageEngine;
};
