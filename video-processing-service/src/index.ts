// index.ts
import express from 'express';
import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories
} from './storage';

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
      return;           // bare return, no value
    }

    const inputFile = filename;
    const outputFile = `processed-${filename}`;

    try {
      await downloadRawVideo(inputFile);
      await convertVideo(inputFile, outputFile);
      await uploadProcessedVideo(outputFile);
    } catch (err) {
      console.error(err);
      await Promise.all([
        deleteRawVideo(inputFile),
        deleteProcessedVideo(outputFile),
      ]);
      res.status(500).send('Processing failed');
      return;
    }

    // clean up
    await Promise.all([
      deleteRawVideo(inputFile),
      deleteProcessedVideo(outputFile),
    ]);

    res.status(200).send('Processing finished successfully');
    // function falls off here, implicitly returning void
  }
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
