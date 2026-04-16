'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

// Next.js dynamic import to completely avoid SSR for A-Frame components
const ARViewer = dynamic(() => import('@/components/ARViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex bg-black min-h-screen items-center justify-center">
      <div className="text-white text-xl animate-pulse">Initializing AR Camera...</div>
    </div>
  ),
});

export default function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <>
      <ARViewer projectId={id} />
    </>
  );
}
