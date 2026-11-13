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
      className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-elevated border border-border relative select-none max-w-full ${
        isFullscreen
          ? "h-[100dvh] w-[100vw] fixed inset-0 z-50 rounded-none pt-safe pb-safe"
          : "h-[50dvh] sm:h-[620px]"
      } ${className || ""}`}
    >
      {/* Barra de Controles Superiores com Safe Area */}
      <div className="h-12 sm:h-12 bg-slate-800/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between text-slate-200 border-b border-slate-700/80 gap-1 sm:gap-2">
        <div className="flex items-center space-x-2 truncate max-w-[140px] sm:max-w-xs">
          <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs font-medium truncate" title={fileName}>
            {fileName}
          </span>
        </div>

        {/* Botões de Ação de Visualização com Touch Targets */}
        <div className="flex items-center space-x-0.5 sm:space-x-1.5">
          <button
            onClick={handleZoomOut}
            aria-label="Reduzir zoom"
            className="touch-target p-2 text-slate-300 hover:text-white rounded-md active:bg-slate-700"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-[11px] sm:text-xs font-mono px-1 text-slate-400 min-w-[38px] text-center">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            aria-label="Aumentar zoom"
            className="touch-target p-2 text-slate-300 hover:text-white rounded-md active:bg-slate-700"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5 hidden xs:block" />

          <button
            onClick={handleRotate}
            aria-label="Girar documento"
            className="touch-target p-2 text-slate-300 hover:text-white rounded-md active:bg-slate-700"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            className="touch-target p-2 text-slate-300 hover:text-white rounded-md active:bg-slate-700"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={handlePrint}
            aria-label="Imprimir documento"
            className="touch-target p-2 text-slate-300 hover:text-white rounded-md active:bg-slate-700 hidden sm:flex"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Área Central de Visualização */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950/90 relative max-w-full">
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
            // Renderização simulada elegante e proporcional
            <div
              className="bg-white text-slate-900 rounded-sm shadow-2xl p-5 sm:p-10 max-w-2xl w-full min-h-[380px] sm:min-h-[500px] space-y-4 sm:space-y-6 mx-auto overflow-hidden"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-[#0F4C5C] block truncate">
                    REPÚBLICA FEDERATIVA DO BRASIL
                  </span>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase mt-0.5 truncate">
                    Administração Pública Municipal • Gabinete Oficial
                  </p>
                </div>
                <span className="text-[9px] font-mono border border-slate-300 px-1.5 py-0.5 rounded bg-slate-50 flex-shrink-0">
                  VIA DIGITAL
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                <div className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2">
                  {fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")}
                </div>

                <p className="text-[11px] sm:text-xs indent-4 sm:indent-6">
                  Certificamos a conferência e guarda permanente deste documento oficial com conformidade à integridade documental e armazenamento criptografado em nuvem (ArquivoSec).
                </p>

                {ocrText && (
                  <div className="bg-slate-50 border-l-2 border-[#0F4C5C] p-2 sm:p-3 text-[10px] sm:text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-normal rounded-r max-h-48 overflow-y-auto">
                    {ocrText}
                  </div>
                )}
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
              className="bg-slate-800 text-slate-200 rounded-lg p-6 max-w-sm text-center space-y-3 shadow-xl border border-slate-700"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="h-12 w-12 mx-auto rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-xs sm:text-sm truncate">{fileName}</h4>
              <p className="text-[11px] text-slate-400">
                Imagem digitalizada em alta definição arquivada com segurança.
              </p>
            </div>
          )
        ) : (
          <div className="text-center text-slate-400 p-6">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-xs sm:text-sm font-medium">Visualização direta indisponível para este formato.</p>
          </div>
        )}
      </div>
    </div>
  );
}
