import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../controllers/transcriptionController';

export const transcriptionRoutes = Router();

const upload = multer({ dest: 'uploads/' });

transcriptionRoutes.post('/transcribe-audio', upload.single('audio'), transcribeAudio);

