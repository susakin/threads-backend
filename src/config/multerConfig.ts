import { extname } from 'path';
import { diskStorage } from 'multer';
import ShortUniqueId from 'short-unique-id';
const uuid = new ShortUniqueId({ length: 11 });

export const multerConfig = {
  limits: {
    fileSize: 1024 * 1024 * 200,
  },
  fileFilter: (_req, file: Express.Multer.File, cb) => {
    return cb(
      null,
      file.mimetype.match(/image\/(jpeg|png|gif)|video\/(mp4|quicktime)$/),
    );
  },
  storage: diskStorage({
    destination: 'uploads/',
    filename: (_req, file, cb) => {
      const suffix = extname(file.originalname);
      return cb(null, `${uuid.rnd()}${suffix}`);
    },
  }),
};
