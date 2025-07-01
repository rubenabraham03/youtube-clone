'use client';

import { useSearchParams } from 'next/navigation';

export default function WatchClient() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  const videoPrefix = 'https://storage.googleapis.com/ra-yt-processed-videos/';
  const videoSrc = videoId ? videoPrefix + videoId : '';

  return (
    <div>
      <p>Watch Page</p>
      {videoSrc ? (
        <video controls src={videoSrc} />
      ) : (
        <p>No video selected</p>
      )}
    </div>
  );
}
