// /app/watch/page.tsx
import { Suspense } from "react";
import WatchClient from "./watchclient";

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading video...</div>}>
      <WatchClient />
    </Suspense>
  );
}

