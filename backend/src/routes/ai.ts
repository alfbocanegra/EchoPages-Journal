import { Router, Request, Response } from 'express';
import multer from 'multer';
import { OpenAIService } from '../services/ai/OpenAIService';

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (OpenAI Whisper limit)
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Get AI journaling prompt
router.get('/prompt', async (req: Request, res: Response) => {
  try {
    const prompt = await OpenAIService.getPrompt();
    res.json({ prompt });
  } catch (error) {
    console.error('Error getting AI prompt:', error);
    res.status(500).json({ error: 'Failed to get AI prompt' });
  }
});

// Get AI reflection suggestion
router.get('/reflection', async (req: Request, res: Response) => {
  try {
    const suggestion = await OpenAIService.getReflectionSuggestion();
    res.json({ suggestion });
  } catch (error) {
    console.error('Error getting AI reflection:', error);
    res.status(500).json({ error: 'Failed to get AI reflection suggestion' });
  }
});

// Voice-to-text transcription
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' });
      return;
    }

    const { buffer, originalname } = req.file;
    const transcription = await OpenAIService.transcribeAudio(buffer, originalname);

    res.json({
      transcription,
      filename: originalname,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to transcribe audio',
    });
  }
});

export default router;
