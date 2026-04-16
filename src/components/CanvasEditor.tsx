// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';

export default function CanvasEditor({ projectId }: { projectId: string }) {
  const [projectData, setProjectData] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);
  const [hideQR, setHideQR] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // A4 aspect ratio at screen resolution suitable for manipulation
  const CANVAS_WIDTH = 595;
  const CANVAS_HEIGHT = 842;

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (data) {
        setProjectData(data);
        
        // Generate QR code
        const viewUrl = `${window.location.origin}/view/${projectId}`;
        const qr = await QRCode.toDataURL(viewUrl, { margin: 1, width: 150 });
        setQrDataUrl(qr);

        // Load photo
        const pImg = new window.Image();
        pImg.crossOrigin = 'Anonymous';
        pImg.src = data.image_url;
        pImg.onload = () => setPhotoImg(pImg);

        // Load QR
        const qImg = new window.Image();
        qImg.crossOrigin = 'Anonymous';
        qImg.src = qr;
        qImg.onload = () => setQrImg(qImg);
      }
    }
    loadProject();
  }, [projectId]);

  const exportPDF = async () => {
    if (!containerRef.current) return;
    
    // Use html2canvas to capture the visual output layer around the canvas
    const canvas = await html2canvas(containerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`FrameAlive-${projectId}.pdf`);
  };

  if (!projectData) {
    return <div className="text-white text-center p-10">Loading project...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Editor</h2>
        <p className="text-gray-400">Your photo and the generated AR code are placed on an standard A4 layout. Click 'Download PDF' to export and print!</p>
        <label className="flex items-center justify-center gap-2 mt-4 text-white cursor-pointer bg-gray-800 py-2 px-4 rounded-lg hover:bg-gray-700 w-max mx-auto shadow">
          <input type="checkbox" checked={hideQR} onChange={(e) => setHideQR(e.target.checked)} className="w-4 h-4 cursor-pointer" />
          Hide QR Code from printed photo (Share URL separately to trigger AR magically!)
        </label>
      </div>

      <div className="bg-white p-2 rounded-md shadow-2xl overflow-hidden" style={{ width: CANVAS_WIDTH + 16 }}>
        <div ref={containerRef} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, background: '#fff', position: 'relative' }}>
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            <Layer>
              {/* White background */}
              <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="white" />
              
              {/* Main Photo placed conditionally */}
              {photoImg && (
                <KonvaImage 
                  image={photoImg} 
                  x={50} y={50} 
                  width={CANVAS_WIDTH - 100} 
                  height={(photoImg.height / photoImg.width) * (CANVAS_WIDTH - 100)} 
                  draggable 
                />
              )}

              {/* QR Code placed at bottom right */}
              {!hideQR && qrImg && (
                <KonvaImage 
                  image={qrImg} 
                  x={CANVAS_WIDTH - 180} 
                  y={CANVAS_HEIGHT - 180} 
                  width={150} 
                  height={150} 
                  draggable 
                />
              )}

              {!hideQR && (
                <Text 
                  text="Scan this QR code and point your camera at the photo to bring it to life!" 
                  x={50} 
                  y={CANVAS_HEIGHT - 100} 
                  width={CANVAS_WIDTH - 250} 
                  fontSize={16} 
                  fill="#333" 
                  align="left"
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      <button 
        onClick={exportPDF} 
        className="py-3 px-8 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform hover:scale-105"
      >
        Download Print-Ready PDF
      </button>

      <a 
        href={`/view/${projectId}`} 
        target="_blank" 
        className="text-blue-400 hover:text-blue-300 underline text-sm"
      >
        Test Viewer Page Link
      </a>
    </div>
  );
}
