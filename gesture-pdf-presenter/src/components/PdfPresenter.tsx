import React, { useEffect, useRef, useState, useCallback } from "react";
import HandGestureCamera, { Gesture } from "./HandGestureCamera";

type Tool = "none" | "pen" | "highlighter" | "eraser";

interface Stroke {
  tool: Tool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

const PEN_COLOR = "#ef4444";
const HL_COLOR = "rgba(250,204,21,0.45)";

export const PdfPresenter: React.FC = () => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [tool, setTool] = useState<Tool>("none");
  const [gestureControl, setGestureControl] = useState(true);
  const [hint, setHint] = useState<string>("Upload a PDF to begin");

  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const strokesByPage = useRef<Record<number, Stroke[]>>({});
  const currentStroke = useRef<Stroke | null>(null);
  const drawing = useRef(false);

  // Load pdfjs lazily client-side
  const pdfjsRef = useRef<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      // worker
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      if (mounted) pdfjsRef.current = pdfjs;
    })();
    return () => { mounted = false; };
  }, []);

  const handleFile = async (file: File) => {
    if (!pdfjsRef.current) {
      setHint("PDF engine still loading, try again in a sec…");
      return;
    }
    const buf = await file.arrayBuffer();
    const doc = await pdfjsRef.current.getDocument({ data: buf }).promise;
    setPdfDoc(doc);
    setNumPages(doc.numPages);
    setPage(1);
    strokesByPage.current = {};
    setHint("");
  };

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !pageCanvasRef.current) return;
    const p = await pdfDoc.getPage(page);
    const containerW = containerRef.current?.clientWidth ?? 900;
    const viewport0 = p.getViewport({ scale: 1 });
    const scale = Math.min(2, (containerW - 32) / viewport0.width);
    const viewport = p.getViewport({ scale });

    const canvas = pageCanvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await p.render({ canvasContext: ctx, viewport, canvas }).promise;

    const draw = drawCanvasRef.current!;
    draw.width = viewport.width;
    draw.height = viewport.height;
    redrawStrokes();
  }, [pdfDoc, page]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => {
    const onResize = () => renderPage();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [renderPage]);

  const redrawStrokes = () => {
    const c = drawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    const strokes = strokesByPage.current[page] ?? [];
    for (const s of strokes) drawStroke(ctx, s);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    if (s.points.length < 1) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  };

  const getPos = (e: React.PointerEvent) => {
    const c = drawCanvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === "none") return;
    drawing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = getPos(e);
    const stroke: Stroke = {
      tool,
      color: tool === "highlighter" ? HL_COLOR : tool === "pen" ? PEN_COLOR : "#000",
      size: tool === "highlighter" ? 22 : tool === "eraser" ? 24 : 3,
      points: [p],
    };
    currentStroke.current = stroke;
    if (!strokesByPage.current[page]) strokesByPage.current[page] = [];
    strokesByPage.current[page].push(stroke);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !currentStroke.current) return;
    const p = getPos(e);
    currentStroke.current.points.push(p);
    redrawStrokes();
  };

  const onPointerUp = () => {
    drawing.current = false;
    currentStroke.current = null;
  };

  const clearAnnotations = () => {
    strokesByPage.current[page] = [];
    redrawStrokes();
  };

  const screenshot = () => {
    const pc = pageCanvasRef.current;
    const dc = drawCanvasRef.current;
    if (!pc || !dc) return;
    const out = document.createElement("canvas");
    out.width = pc.width;
    out.height = pc.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(pc, 0, 0);
    ctx.drawImage(dc, 0, 0);
    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `screenshot-page-${page}-${Date.now()}.png`;
    a.click();
    flashHint("Screenshot saved");
  };

  const flashHint = (msg: string) => {
    setHint(msg);
    setTimeout(() => setHint(""), 1500);
  };

  const next = () => setPage((p) => Math.min(numPages, p + 1));
  const prev = () => setPage((p) => Math.max(1, p - 1));

  const handleGesture = useCallback((g: Gesture) => {
    if (!gestureControl || !pdfDoc) return;
    switch (g) {
      case "Open Palm":
        next(); flashHint("→ Next"); break;
      case "Fist":
        prev(); flashHint("← Previous"); break;
      case "Peace":
        setTool((t) => (t === "pen" ? "none" : "pen")); flashHint("Pen toggled"); break;
      case "Pointing":
        setTool((t) => (t === "highlighter" ? "none" : "highlighter")); flashHint("Highlighter toggled"); break;
      case "Thumbs Up":
        screenshot(); break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureControl, pdfDoc, numPages, page]);

  // Keyboard fallback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key.toLowerCase() === "p") setTool((t) => (t === "pen" ? "none" : "pen"));
      else if (e.key.toLowerCase() === "h") setTool((t) => (t === "highlighter" ? "none" : "highlighter"));
      else if (e.key.toLowerCase() === "s") screenshot();
      else if (e.key.toLowerCase() === "c") clearAnnotations();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages, page]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">Gesture PDF Presenter</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm cursor-pointer hover:opacity-90">
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <ToolBtn active={tool === "pen"} onClick={() => setTool(tool === "pen" ? "none" : "pen")}>Pen</ToolBtn>
          <ToolBtn active={tool === "highlighter"} onClick={() => setTool(tool === "highlighter" ? "none" : "highlighter")}>Highlighter</ToolBtn>
          <ToolBtn active={tool === "eraser"} onClick={() => setTool(tool === "eraser" ? "none" : "eraser")}>Eraser</ToolBtn>
          <button onClick={clearAnnotations} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-accent">Clear</button>
          <button onClick={screenshot} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-accent">Screenshot</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 p-4">
        <div ref={containerRef} className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
          {!pdfDoc && (
            <div className="text-center p-10 text-muted-foreground">
              <p className="text-lg mb-2">No PDF loaded</p>
              <p className="text-sm">{hint || "Click Upload PDF to start"}</p>
            </div>
          )}
          <div className="relative" style={{ display: pdfDoc ? "block" : "none" }}>
            <canvas ref={pageCanvasRef} className="block bg-white shadow" />
            <canvas
              ref={drawCanvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="absolute inset-0"
              style={{ touchAction: "none", cursor: tool === "none" ? "default" : "crosshair" }}
            />
            {hint && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-1 rounded-full shadow">
                {hint}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={page <= 1} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent">Prev</button>
            <div className="text-sm">
              Page <strong>{pdfDoc ? page : 0}</strong> / {numPages}
            </div>
            <button onClick={next} disabled={page >= numPages} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent">Next</button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={gestureControl} onChange={(e) => setGestureControl(e.target.checked)} />
            Gesture control
          </label>

          {gestureControl && <HandGestureCamera onGesture={handleGesture} width={320} height={240} />}

          <div className="rounded-lg border border-border p-3 text-sm space-y-1">
            <div className="font-medium mb-1">Gestures</div>
            <div>✋ Open Palm → Next page</div>
            <div>✊ Fist → Previous page</div>
            <div>✌️ Peace → Toggle Pen</div>
            <div>☝️ Pointing → Toggle Highlighter</div>
            <div>👍 Thumbs Up → Screenshot</div>
          </div>
          <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">Keyboard</div>
            <div>← / → navigate · P pen · H highlighter · S screenshot · C clear</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToolBtn: React.FC<React.PropsWithChildren<{ active: boolean; onClick: () => void }>> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
    }`}
  >
    {children}
  </button>
);

export default PdfPresenter;