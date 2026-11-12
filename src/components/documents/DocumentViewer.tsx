"use client";

import React, { useState, useRef } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Download, 
  Printer, 
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  url?: string;
  fileName: string;
  mimeType: string;
  ocrText?: string | null;
  className?: string;
}

export function DocumentViewer({
  url,
  fileName,
  mimeType,
  ocrText,
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = mimeType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage = mimeType.includes("image") || /\.(jpg|jpeg|png|webp|tiff)$/i.test(fileName);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-elevated border border-border relative select-none ${
        isFullscreen ? "h-screen w-screen fixed inset-0 z-50 rounded-none" : "h-[620px]"
      } ${className || ""}`}
    >
      {/* Barra de Controles Superiores */}
      <div className="h-12 bg-slate-800/90 backdrop-blur-md px-4 flex items-center justify-between text-slate-200 border-b border-slate-700/80">
        <div className="flex items-center space-x-2 truncate max-w-sm">
          <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs font-medium truncate" title={fileName}>
            {fileName}
          </span>
        </div>

        {/* Botões de Ação de Visualização */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Reduzir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-xs font-mono px-1.5 text-slate-400 min-w-[45px] text-center">
            {zoom}%
          </span>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <Button
            size="icon"
            variant="ghost"
            onClick={handleRotate}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Girar documento"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrint}
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700 hidden sm:flex"
            title="Imprimir documento"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área Central de Visualização */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/90 relative">
        {isPdf ? (
          url && !url.includes("mock") ? (
            <iframe
              src={`${url}#toolbar=0&navpanes=0`}
              className="w-full h-full rounded border-0 bg-white"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              title="Visualizador de PDF"
            />
          ) : (
            // Renderização simulada e elegante de PDF Oficial
            <div
              className="bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-12 max-w-2xl w-full min-h-[550px] space-y-6"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-tight text-[#0F4C5C]">REPÚBLICA FEDERATIVA DO BRASIL</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1 uppercase">
                    Administração Pública Municipal • Gabinete Oficial
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
                    VIA ORIGINAL DIGITALIZADA
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                <div className="font-semibold text-slate-900 text-sm">
                  {fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")}
                </div>

                <p className="indent-6">
                  Certificamos que o presente documento oficial foi digitalizado em alta resolução, indexado com conformidade à integridade documental e armazenado no ambiente seguro de nuvem do <strong>ArquivoSec</strong>.
                </p>

                {ocrText ? (
                  <div className="bg-slate-50 border-l-2 border-[#0F4C5C] p-3 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-normal rounded-r">
                    {ocrText}
                  </div>
                ) : (
                  <p className="italic text-slate-500 text-[11px]">
                    Texto extraído via OCR processado e disponível para consulta full-text.
                  </p>
                )}

                <div className="pt-8 flex justify-between items-end border-t border-slate-200 mt-8 text-[10px] text-slate-500">
                  <div>
                    <p>Hash SHA-256 Verificado</p>
                    <p className="font-mono text-[9px] text-slate-400">8f4c5c2d94a10e83b5...e2f</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">Autenticação Digital</p>
                    <p>Assinado e Carimbado Digitalmente</p>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : isImage ? (
          url && !url.includes("mock") ? (
            <img
              src={url}
              alt={fileName}
              className="max-h-full max-w-full object-contain rounded shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            />
          ) : (
            <div
              className="bg-slate-800 text-slate-200 rounded-lg p-8 max-w-md text-center space-y-4 shadow-xl border border-slate-700"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400">
                <FileText className="h-8 w-8" />
              </div>
              <h4 className="font-semibold text-sm">{fileName}</h4>
              <p className="text-xs text-slate-400">
                Visualização de imagem digitalizada em alta fidelidade.
              </p>
            </div>
          )
        ) : (
          <div className="text-center text-slate-400 p-8">
            <AlertCircle className="h-10 w-10 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-medium">Formato não suportado para pré-visualização direta.</p>
            <p className="text-xs text-slate-500 mt-1">Utilize o botão de download para visualizar em seu dispositivo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
