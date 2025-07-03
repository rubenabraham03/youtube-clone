import express from 'express';
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories
} from './storage';

import { isVideoNew, setVideo } from "./firebase";

setupDirectories();

const app = express();
app.use(express.json());

interface PubSubPayload {
  message: {
    data: string;
  };
}

app.post<{}, any, PubSubPayload>(
  '/process-video',
  async (req, res): Promise<void> => {
    let filename: string;

    // decode and parse
    try {
      const raw = Buffer.from(req.body.message.data, 'base64').toString('utf8');
      const parsed = JSON.parse(raw) as { name?: string };
      if (!parsed.name) throw new Error('no name');
      filename = parsed.name;
    } catch (err) {
      console.error(err);
      res.status(400).send('Bad Request: invalid Pub/Sub message');
      return;
    }

    const inputFile = filename;
    const outputFile = `processed-${filename}`;
    const videoId = filename.split('.')[0]; // e.g. UID-DATE from <UID>-<DATE>.<ext>

    try {
      // Check if video is new
      if (!await isVideoNew(videoId)) {
        res.status(400).send('Bad Request: video already processing or processed.');
        return;
      }

      // Mark video as processing
      await setVideo(videoId, {
        id: videoId,
        uid: videoId.split('-')[0],
        status: 'processing',
      });

      // Download raw video
      await downloadRawVideo(inputFile);

      // Convert/process video
      await convertVideo(inputFile, outputFile);

      // Upload processed video
      await uploadProcessedVideo(outputFile);

      // Mark video as processed with filename
      await setVideo(videoId, {
        status: 'processed',
        filename: outputFile,
      });

      // Clean up: delete raw and processed videos from storage
      await Promise.all([
        deleteRawVideo(inputFile),
        deleteProcessedVideo(outputFile),
      ]);

      res.status(200).send('Processing finished successfully');
    } catch (err) {
      console.error(err);

      // Clean up even on failure
      await Promise.all([
        deleteRawVideo(inputFile),
        deleteProcessedVideo(outputFile),
      ]);

      res.status(500).send('Processing failed');
    }
  }
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
