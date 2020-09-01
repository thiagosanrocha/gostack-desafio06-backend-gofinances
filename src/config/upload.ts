import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const upload = {
  csv: {
    directory: path.resolve(__dirname, '..', '..', 'tmp', 'csv'),
    storage: multer.diskStorage({
      destination: path.resolve(__dirname, '..', '..', 'tmp', 'csv'),
      filename(req, file, callback) {
        const hash = crypto.randomBytes(10).toString('hex');

        const filename = `${hash + path.extname(file.originalname)}`;

        callback(null, filename);
      },
    }),
  },
};

export default upload;
