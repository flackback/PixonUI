import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { 
  X, 
  Download, 
  Printer, 
  Search, 
  Plus, 
  Minus, 
  FileText, 
  Grid, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Globe, 
  Copy, 
  Check, 
  QrCode as QrIcon, 
  Users, 
  Settings, 
  UserCheck, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Share2,
  ExternalLink,
  Info,
  Maximize2,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  DownloadCloud
} from 'lucide-react';
import { Motion } from '../feedback/Motion';
import { ScrollArea } from '../data-display/ScrollArea';

export interface FileAttachment {
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'csv' | 'audio' | 'video' | 'image' | 'link' | 'qrcode' | 'group';
  size?: string;
  duration?: number;
  metadata?: {
    title?: string;
    description?: string;
    domain?: string;
    thumbnail?: string;
    qrcodeValue?: string;
    groupName?: string;
    groupDescription?: string;
    participantsCount?: number;
  };
}

interface UnifiedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileAttachment | null;
}

export function UnifiedPreviewModal({ isOpen, onClose, file }: UnifiedPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPagesCount] = useState(8);
  const [excelSearch, setExcelSearch] = useState('');
  const [selectedExcelRow, setSelectedExcelRow] = useState<number | null>(null);
  
  // Audio Player States
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioProgress, setAudioProgress] = useState(30);
  const audioIntervalRef = useRef<any>(null);

  // Video States
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setAudioPlaying(false);
      setVideoPlaying(false);
      setExcelSearch('');
      setSelectedExcelRow(null);
      setZoom(100);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Handle clipboard copy animation
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated active sound wave height
  const [waveHeights, setWaveHeights] = useState<number[]>(
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 25) + 5)
  );

  useEffect(() => {
    let interval: any;
    if (audioPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
        setWaveHeights(Array.from({ length: 40 }, () => Math.floor(Math.random() * 25) + 5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [audioPlaying]);

  // Mock excel data inside worksheet
  const excelData = useMemo(() => [
    { id: 101, data: '05/05/2026', cliente: 'Anderson Silva', produto: 'PixonUI Pro Multi-brand', quant: 2, unit: 2450.00, total: 4900.00, status: 'Pago' },
    { id: 102, data: '06/05/2026', cliente: 'Camila Fernandes', produto: 'Kanban Supremo Plugin', quant: 1, unit: 450.00, total: 450.00, status: 'Pago' },
    { id: 103, data: '07/05/2026', cliente: 'Rodrigo Motta', produto: 'Enterprise SaaS Dev Kit', quant: 5, unit: 1200.00, total: 6000.00, status: 'Pendente' },
    { id: 104, data: '08/05/2026', cliente: 'Juliana Paes', produto: 'TabuladorMax Core License', quant: 1, unit: 3200.00, total: 3200.00, status: 'Pago' },
    { id: 105, data: '08/05/2026', cliente: 'Pietro Caproni', produto: 'PixonUI Figma Tokens Pack', quant: 10, unit: 99.00, total: 990.00, status: 'Pago' },
    { id: 106, data: '09/05/2026', cliente: 'Mariana Guedes', produto: 'AI Assistant Integration Chat', quant: 2, unit: 1500.00, total: 3000.00, status: 'Cancelado' },
    { id: 107, data: '09/05/2026', cliente: 'Henrique Oliveira', produto: 'Broadcaster Realtime Server', quant: 1, unit: 1850.00, total: 1850.00, status: 'Pago' },
    { id: 108, data: '10/05/2026', cliente: 'Bárbara Schmidt', produto: 'PixonUI Pro Multi-brand', quant: 3, unit: 2450.00, total: 7350.00, status: 'Pago' }
  ], []);

  const filteredExcelData = useMemo(() => {
    if (!excelSearch.trim()) return excelData;
    const query = excelSearch.toLowerCase();
    return excelData.filter(
      item => 
        item.cliente.toLowerCase().includes(query) || 
        item.produto.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
  }, [excelData, excelSearch]);

  const excelTotals = useMemo(() => {
    const total = filteredExcelData.reduce((acc, curr) => acc + curr.total, 0);
    const avg = filteredExcelData.length ? total / filteredExcelData.length : 0;
    return { total, avg };
  }, [filteredExcelData]);

  if (!isOpen || !file) return null;

  const renderViewerContent = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black/10 dark:bg-black/30 rounded-3xl border border-gray-100 dark:border-white/5">
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-h-[60vh] max-w-full rounded-2xl shadow-2xl transition-transform duration-300 object-contain hover:scale-105"
              style={{ transform: `scale(${zoom / 100})` }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-gray-100 dark:border-white/10 shadow-lg">
              <button 
                onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-gray-800 dark:text-white min-w-[48px] text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(prev => Math.min(250, prev + 25))}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/20 dark:bg-black/40 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <video 
              ref={videoRef}
              src={file.url} 
              controls 
              className="max-h-[60vh] w-full rounded-2xl shadow-2xl bg-black"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-500/5 to-cyan-500/5 dark:from-zinc-900/50 dark:to-zinc-950/20 rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-500 p-1 mb-6 shadow-xl shadow-blue-500/20 flex items-center justify-center text-white">
              <Volume2 className="h-10 w-10 animate-bounce" />
            </div>
            
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate max-w-md">{file.name}</h4>
            <p className="text-xs text-gray-400 dark:text-white/40 mb-8 uppercase tracking-widest">{file.size || '3.4 MB'}</p>

            {/* Simulated Animated Waves */}
            <div className="flex items-center justify-center gap-1 h-12 w-full max-w-sm px-4 mb-8">
              {waveHeights.map((height, i) => {
                const filled = i / waveHeights.length * 100 <= audioProgress;
                return (
                  <div 
                    key={i} 
                    style={{ height: `${height}px` }}
                    className={cn(
                      "w-1 rounded-full transition-all duration-150",
                      filled 
                        ? "bg-gradient-to-t from-blue-500 to-cyan-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                        : "bg-gray-200 dark:bg-white/10"
                    )}
                  />
                );
              })}
            </div>

            {/* Custom Control Bar */}
            <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 shadow-xl w-full max-w-md">
              <button 
                onClick={() => setAudioSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
                className="text-xs font-bold text-blue-500 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-all"
              >
                {audioSpeed}x
              </button>

              <button 
                onClick={() => setAudioPlaying(!audioPlaying)}
                className="p-4 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
              >
                {audioPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
              </button>

              <button 
                onClick={() => setAudioProgress(0)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl h-[65vh]">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-gray-700 dark:text-white/80">
                  Página {currentPage} de {pdfPagesCount}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(pdfPagesCount, prev + 1))}
                  disabled={currentPage === pdfPagesCount}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold w-12 text-center text-gray-700 dark:text-white">{zoom}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(200, prev + 10))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button 
                onClick={() => window.print()}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/70"
                title="Imprimir documento"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>

            {/* Document Content Box */}
            <ScrollArea scrollbarSize="sm" className="flex-1 p-8 bg-gray-100/50 dark:bg-black/20 flex justify-center">
              <div 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg p-10 min-h-[842px] transition-transform duration-200"
              >
                {/* Simulated Document Contents */}
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-6 mb-8 text-xs text-gray-400">
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-white text-sm">PIXONUI ENTERPRISE S/A</h5>
                    <p>CNPJ: 42.103.504/0001-90</p>
                    <p>Av. Paulista, 1000 - São Paulo, SP</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-500">RELATÓRIO DE DESEMPENHO</p>
                    <p>Documento No: #10924-B</p>
                    <p>Emissão: 10 de Maio de 2026</p>
                  </div>
                </div>
 
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    1. Visão Geral e Alinhamento de Metas (Página {currentPage})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Este documento detalha os relatórios consolidados de desempenho e os novos padrões arquiteturais de UI do ecossistema PixonUI. Focamos no desenvolvimento de interfaces com taxas de atualização de 120Hz nativas, usando buffers assíncronos e renderizadores virtuais no lado do cliente.
                  </p>
 
                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <h4 className="text-sm font-bold text-blue-500 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Destaque de Desempenho do Kanban Supremo
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      O novo sistema de WIP limits com alarme visual degradê dinâmico e o tracker de tempo dinâmico em segundos integrados reduziram o tempo médio de trânsito de tarefas em 24,8% no primeiro lote de validações.
                    </p>
                  </div>
 
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Nossa equipe tem o orgulho de disponibilizar este conjunto premium de componentes que não só atende às demandas clássicas de software corporativo (como filtros robustos e exportação de planilhas), mas também traz a fluidez das animações por física de mola e o design de glassmorphism premium para o dia-a-dia do desenvolvedor.
                  </p>
 
                  <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex justify-between text-[10px] text-gray-400">
                    <span>PixonUI Enterprise • Confidencial</span>
                    <span>Página {currentPage} de {pdfPagesCount}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );

      case 'doc':
      case 'docx':
        return (
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl h-[65vh]">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
              <span className="text-xs font-bold flex items-center gap-2 text-blue-500">
                <FileText className="h-4 w-4" /> Word Document View
              </span>
              <button 
                onClick={() => handleCopy('PROPOSTA COMERCIAL - PIXONUI SUPREMO...\n\nContrato de Desenvolvimento de Design System premium...\nValor Consolidado: R$ 42.850,00...')}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/70 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>

            <ScrollArea scrollbarSize="sm" className="flex-1 p-10 bg-gray-100/30 dark:bg-black/20 flex justify-center">
              <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-10 min-h-[600px] text-left space-y-6">
                <div className="border-b border-gray-200 dark:border-white/10 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Proposta Comercial - PixonUI Supremo</h1>
                  <p className="text-xs text-gray-400">Última atualização por Anderson Silva há 2 horas</p>
                </div>

                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Prezados diretores de tecnologia,
                  </p>
                  <p>
                    Apresentamos o documento formal de adesão comercial para a customização total das marcas de UI do cliente no ecossistema **PixonUI Supremo**.
                  </p>
                  
                  <h3 className="text-md font-bold text-gray-800 dark:text-white mt-6 mb-2">Escopo da Implantação</h3>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>Correção estrutural do **ChatInput** eliminando restrições de layout.</li>
                    <li>Sincronização em tempo real via canais de websocket de alta vazão.</li>
                    <li>Visualizadores de arquivos integrados com sandbox e decodificadores de dados locais.</li>
                    <li>Componentes interativos de WhatsApp Templates para atendimento ao cliente automatizado de alta fidelidade.</li>
                  </ul>

                  <h3 className="text-md font-bold text-gray-800 dark:text-white mt-6 mb-2">Valores e Prazos</h3>
                  <p>
                    O cronograma estimado para a entrega total do escopo homologado é de 5 dias úteis a partir da validação deste documento. O valor global do projeto de personalização é de **R$ 42.850,00**, faturado em parcelas de compensação via boleto bancário ou PIX corporativo.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        );

      case 'xls':
      case 'xlsx':
      case 'csv':
        return (
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl h-[65vh]">
            {/* Spreadsheet Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-emerald-500/5 dark:bg-emerald-500/10 gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <Grid className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Microsoft Excel View</h4>
                  <p className="text-[10px] text-gray-400 font-semibold">{file.name}</p>
                </div>
              </div>

              {/* Excel Row Search Bar Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  value={excelSearch}
                  onChange={(e) => {
                    setExcelSearch(e.target.value);
                    setSelectedExcelRow(null);
                  }}
                  placeholder="Pesquisar nas planilhas..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                />
              </div>
            </div>

            {/* Table Frame Grid */}
            <ScrollArea scrollbarSize="sm" orientation="both" className="flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-white/5 text-[10px] text-gray-400 uppercase font-bold tracking-wider z-10">
                  <tr>
                    <th className="p-2 border-r border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-zinc-950 w-10 text-center"></th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5">ID Venda (A)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5">Data (B)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5">Cliente (C)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5">Produto (D)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5 text-center">Quant (E)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5 text-right">Unitário (F)</th>
                    <th className="p-3 border-r border-gray-100 dark:border-white/5 text-right">Total (G)</th>
                    <th className="p-3">Status (H)</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 dark:text-white/80 font-medium">
                  {filteredExcelData.map((row, idx) => (
                    <tr 
                      key={row.id}
                      onClick={() => setSelectedExcelRow(row.id)}
                      className={cn(
                        "border-b border-gray-100 dark:border-white/5 cursor-pointer transition-colors",
                        selectedExcelRow === row.id 
                          ? "bg-emerald-500/10 dark:bg-emerald-500/15" 
                          : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      <td className="p-2 border-r border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-950/60 text-center font-mono text-[10px] text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 font-mono text-gray-500">#{row.id}</td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5">{row.data}</td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 font-bold text-gray-900 dark:text-white">{row.cliente}</td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 text-gray-600 dark:text-white/60">{row.produto}</td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 text-center">{row.quant}</td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 text-right font-mono">
                        {row.unit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3 border-r border-gray-100 dark:border-white/5 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          row.status === 'Pago' && "bg-emerald-500/10 text-emerald-500",
                          row.status === 'Pendente' && "bg-amber-500/10 text-amber-500",
                          row.status === 'Cancelado' && "bg-red-500/10 text-red-500"
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredExcelData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-400 dark:text-white/20">
                        Nenhum resultado corresponde à sua pesquisa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>

            {/* Bottom aggregate formulas bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/40 text-xs font-semibold text-gray-600 dark:text-white/60 gap-3">
              <div className="flex gap-4">
                <span>Contagem: <strong className="text-gray-950 dark:text-white">{filteredExcelData.length} itens</strong></span>
                <span className="w-px h-3 bg-gray-200 dark:bg-white/10 self-center" />
                <span>Média: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{excelTotals.avg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
              </div>
              <div className="text-sm">
                Soma Total: <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-lg">{excelTotals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </div>
            </div>
          </div>
        );

      case 'link': {
        const linkData = file.metadata || {
          title: 'PixonUI Supreme Docs - Interfaces que deslumbram',
          description: 'Explore a biblioteca de design systems brasileira mais inovadora com suporte nativo a mola, glassmorphism de 120Hz e layouts altamente responsivos para os seus apps.',
          domain: 'pixonui.dev',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'
        };
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-cyan-500/5 to-blue-500/5 dark:from-zinc-900/50 dark:to-zinc-950/20 rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full hover:scale-105 transition-all">
              <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-zinc-950">
                <img src={linkData.thumbnail} alt="Link cover" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {linkData.domain}
                </div>
              </div>
              
              <div className="p-5 text-left space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {linkData.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed line-clamp-3">
                  {linkData.description}
                </p>
                
                <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex gap-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-colors"
                  >
                    Visitar Link <ExternalLink className="h-3 w-3" />
                  </a>
                  <button 
                    onClick={() => handleCopy(file.url)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-white"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      }

      case 'qrcode': {
        const qrValue = file.metadata?.qrcodeValue || '00020126580014BR.GOV.BCB.PIX0136pixonui-supremo-key-payment-address520400005303986540510.005802BR5924PIXONUI ENTERPRISE LTD6009SAO PAULO62070503***6304BF92';
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-500/5 to-purple-500/5 dark:from-zinc-900/50 dark:to-zinc-950/20 rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center max-w-sm w-full space-y-6">
              
              <div className="flex items-center justify-between w-full border-b border-gray-100 dark:border-white/5 pb-3">
                <span className="text-xs font-bold flex items-center gap-2 text-blue-500">
                  <QrIcon className="h-4 w-4" /> Pagamento Via PIX / QR Code
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">Ativo</span>
              </div>

              {/* Generative High Res SVG QR Code representation */}
              <div className="p-4 rounded-2xl bg-white border border-gray-100/80 shadow-inner hover:scale-105 transition-transform">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
                  {/* Outer Frame */}
                  <rect x="10" y="10" width="40" height="40" stroke="currentColor" strokeWidth="8" rx="4" />
                  <rect x="22" y="22" width="16" height="16" fill="currentColor" rx="2" />
                  <rect x="150" y="10" width="40" height="40" stroke="currentColor" strokeWidth="8" rx="4" />
                  <rect x="162" y="22" width="16" height="16" fill="currentColor" rx="2" />
                  <rect x="10" y="150" width="40" height="40" stroke="currentColor" strokeWidth="8" rx="4" />
                  <rect x="22" y="162" width="16" height="16" fill="currentColor" rx="2" />
                  {/* Central Alignment dot */}
                  <rect x="90" y="90" width="20" height="20" fill="currentColor" rx="4" />
                  {/* Scattered QR modules */}
                  <rect x="65" y="20" width="15" height="15" fill="currentColor" rx="2" />
                  <rect x="100" y="30" width="25" height="10" fill="currentColor" rx="2" />
                  <rect x="120" y="15" width="15" height="15" fill="currentColor" rx="2" />
                  
                  <rect x="20" y="65" width="15" height="25" fill="currentColor" rx="2" />
                  <rect x="45" y="100" width="15" height="15" fill="currentColor" rx="2" />
                  
                  <rect x="155" y="65" width="15" height="15" fill="currentColor" rx="2" />
                  <rect x="140" y="100" width="25" height="15" fill="currentColor" rx="2" />
                  <rect x="165" y="125" width="15" height="25" fill="currentColor" rx="2" />
                  
                  <rect x="65" y="145" width="25" height="15" fill="currentColor" rx="2" />
                  <rect x="105" y="160" width="15" height="15" fill="currentColor" rx="2" />
                  <rect x="125" y="145" width="15" height="15" fill="currentColor" rx="2" />
                  
                  <rect x="65" y="65" width="15" height="15" fill="currentColor" rx="2" />
                  <rect x="120" y="65" width="15" height="15" fill="currentColor" rx="2" />
                </svg>
              </div>

              <div className="w-full space-y-2">
                <p className="text-xs text-center text-gray-500">
                  Escaneie o código acima ou use a chave de Pix copia e cola abaixo para efetivar a transação.
                </p>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-950 font-mono text-[10px] break-all select-all text-gray-600 dark:text-gray-400">
                  <span className="line-clamp-2 flex-1">{qrValue}</span>
                  <button 
                    onClick={() => handleCopy(qrValue)}
                    className="p-2 rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/10 hover:scale-105 transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );

      }

      case 'group': {
        const groupName = file.metadata?.groupName || '🚀 PixonUI Supremo Core Team';
        const groupDesc = file.metadata?.groupDescription || 'Canal de comunicação interno focado em refactoring arquitetural de alto nível e implantações premium de design system.';
        const mockMembers = [
          { name: 'Anderson Silva', role: 'Criador do Grupo', status: 'Online', color: 'from-cyan-500 to-blue-600' },
          { name: 'Juliana Paes', role: 'Administradora', status: 'Em reunião', color: 'from-pink-500 to-rose-500' },
          { name: 'Rodrigo Motta', role: 'Membro', status: 'Offline', color: 'from-amber-500 to-orange-500' },
          { name: 'Camila Fernandes', role: 'Membro', status: 'Online', color: 'from-emerald-500 to-teal-500' },
          { name: 'Pietro Caproni', role: 'Membro', status: 'Online', color: 'from-indigo-500 to-purple-500' }
        ];

        return (
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl h-[65vh]">
            <div className="flex flex-col md:flex-row h-full">
              
              {/* Group Meta Sidebar */}
              <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20 text-left space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/10 flex items-center justify-center text-white text-2xl font-bold">
                    {groupName[2]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{groupName}</h3>
                    <p className="text-xs text-gray-400">Grupo WhatsApp Business • 5 Integrantes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Descrição do Grupo</span>
                  <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                    {groupDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Configurações Rápidas</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-white">
                      <Settings className="h-3.5 w-3.5" /> Ajustes
                    </button>
                    <button 
                      onClick={() => handleCopy('https://chat.whatsapp.com/invite/pixonui-supremo-master-group')}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-white"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />} Convidar
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Members Section */}
              <div className="flex-1 p-6 text-left flex flex-col h-full overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-4">Membros Ativos ({mockMembers.length})</span>
                
                <ScrollArea scrollbarSize="sm" className="flex-1 pr-2">
                  <div className="space-y-3">
                    {mockMembers.map((member, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                              {member.name}
                              {member.role.includes('Administradora') || member.role.includes('Criador') ? (
                                <span className="text-[9px] font-bold text-blue-500 px-1.5 py-0.5 rounded bg-blue-500/10 uppercase">Admin</span>
                              ) : null}
                            </p>
                            <p className="text-[10px] text-gray-400">{member.status}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-2 w-2 rounded-full",
                            member.status === 'Online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

            </div>
          </div>
        );

      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Full Screen Blur Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-[120] bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-4 md:inset-12 z-[130] flex items-center justify-center p-4">
        <Motion preset="spring" className="w-full max-w-4xl h-full flex items-center justify-center">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl w-full max-h-[85vh] flex flex-col p-6 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  {file.type === 'image' && <Maximize2 className="h-5 w-5" />}
                  {file.type === 'video' && <Play className="h-5 w-5" />}
                  {file.type === 'audio' && <Volume2 className="h-5 w-5" />}
                  {file.type === 'pdf' && <FileText className="h-5 w-5" />}
                  {file.type === 'doc' && <FileText className="h-5 w-5" />}
                  {file.type === 'docx' && <FileText className="h-5 w-5" />}
                  {file.type === 'xls' && <Grid className="h-5 w-5" />}
                  {file.type === 'xlsx' && <Grid className="h-5 w-5" />}
                  {file.type === 'csv' && <Grid className="h-5 w-5" />}
                  {file.type === 'link' && <Globe className="h-5 w-5" />}
                  {file.type === 'qrcode' && <QrIcon className="h-5 w-5" />}
                  {file.type === 'group' && <Users className="h-5 w-5" />}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {file.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                    Visualizador Supremo • PixonUI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={file.url} 
                  download={file.name}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-white transition-all hover:scale-105"
                  title="Baixar arquivo original"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button 
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-gray-500 dark:text-white transition-all hover:scale-105"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Viewer Workspace */}
            {renderViewerContent()}
            
          </div>
        </Motion>
      </div>
    </>
  );
}
