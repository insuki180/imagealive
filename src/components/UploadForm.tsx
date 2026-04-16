// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function UploadForm() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [mindFile, setMindFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !video || !mindFile) {
      setStatus('error');
      setMessage('Please upload all three files (Photo, Video, and .mind file).');
      return;
    }

    if (video.size > 5 * 1024 * 1024) {
      setStatus('error');
      setMessage('Video must be under 5MB.');
      return;
    }

    try {
      setStatus('uploading');
      setMessage('Uploading files to Supabase...');

      const uniqueId = uuidv4();
      const photoName = `${uniqueId}-${photo.name}`;
      const videoName = `${uniqueId}-${video.name}`;
      const mindName = `${uniqueId}-${mindFile.name}`;

      // Upload Photo
      const { error: photoErr } = await supabase.storage.from('images').upload(photoName, photo);
      if (photoErr) throw photoErr;
      const photoUrl = supabase.storage.from('images').getPublicUrl(photoName).data.publicUrl;

      // Upload Video
      setMessage('Uploading video...');
      const { error: vidErr } = await supabase.storage.from('videos').upload(videoName, video);
      if (vidErr) throw vidErr;
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoName).data.publicUrl;

      // Upload Mind File
      setMessage('Uploading tracking data...');
      const { error: mindErr } = await supabase.storage.from('tracking').upload(mindName, mindFile);
      if (mindErr) throw mindErr;
      const trackingUrl = supabase.storage.from('tracking').getPublicUrl(mindName).data.publicUrl;

      setMessage('Saving project...');
      const { data, error: dbErr } = await supabase.from('projects').insert({
        image_url: photoUrl,
        video_url: videoUrl,
        tracking_url: trackingUrl
      }).select().single();

      if (dbErr) throw dbErr;

      setStatus('success');
      setMessage('Success! Redirecting to editor...');
      
      router.push(`/editor/${data.id}`);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'An error occurred during upload.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-white text-center tracking-tight">Create your AR Frame</h2>
      
      <form onSubmit={handleUpload} className="space-y-6">
        {/* Step 1: Media Files */}
        <div className="p-5 rounded-xl bg-black/20 border border-white/10 transition-all hover:bg-black/30">
          <h3 className="text-lg font-semibold text-white/90 mb-4">1. Select your Media</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Target Photo (Image)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">AR Video (Max 5MB)</label>
              <input 
                type="file" 
                accept="video/*" 
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 transition"
              />
            </div>
          </div>
        </div>

        {/* Step 2: MindAR Compiler */}
        <div className="p-5 rounded-xl bg-black/20 border border-white/10 transition-all hover:bg-black/30">
          <h3 className="text-lg font-semibold text-white/90 mb-4">2. Generate Tracking File</h3>
          <p className="text-sm text-white/60 mb-3">
            To make the AR work, we need a tracking file. Go to the <a href="https://hiukim.github.io/mind-ar-js-doc/tools/compile" target="_blank" rel="noreferrer" className="text-blue-400 font-bold hover:underline">MindAR Compiler</a>, upload your target photo above, and download the <code className="bg-black/50 px-1 rounded">.mind</code> file.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Upload .mind File</label>
            <input 
              type="file" 
              accept=".mind" 
              onChange={(e) => setMindFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition"
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="p-3 rounded bg-red-500/20 text-red-200 border border-red-500/30 text-sm">
            {message}
          </div>
        )}
        
        {status === 'uploading' && (
          <div className="p-3 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30 text-sm animate-pulse flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="p-3 rounded bg-green-500/20 text-green-200 border border-green-500/30 text-sm">
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'uploading' || status === 'success'}
          className="w-full py-3 px-4 rounded-xl font-bold shadow-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {status === 'uploading' ? 'Processing...' : 'Bring Photo to Life'}
        </button>
      </form>
    </div>
  );
}
