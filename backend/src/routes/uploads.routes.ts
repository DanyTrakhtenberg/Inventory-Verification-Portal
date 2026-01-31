import { Router } from 'express';
import multer from 'multer';
import * as uploadsController from '../controllers/uploads.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', upload.single('file'), uploadsController.uploadFile);
router.get('/', uploadsController.listUploads);
router.get('/:id', uploadsController.getUpload);

export default router;
