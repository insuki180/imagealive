'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

// Konva causes reference errors with 'window' during Server-Side Rendering.
// Using next/dynamic with ssr: false forces the editor to be client-side only.
const EditorComponent = dynamic(() => import('@/components/CanvasEditor'), {
  ssr: false,
  loading: () => <div className="text-white text-center p-20 animate-pulse">Loading Editor...</div>,
});

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <main className="min-h-screen bg-gray-900 pt-10 pb-20">
      <EditorComponent projectId={id} />
    </main>
  );
}
