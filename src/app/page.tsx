import UploadForm from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/30 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-violet-900/30 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-4">
            FrameAlive
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Scan your photo and watch it come alive. Create immersive AR experiences in minutes.
          </p>
        </div>

        <UploadForm />
      </div>
    </main>
  );
}
