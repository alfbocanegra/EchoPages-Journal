import React, { useRef, useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface HandwritingInputCanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
}

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;

const HandwritingInputCanvas: React.FC<HandwritingInputCanvasProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  penColor = '#222',
  penWidth = 3,
  backgroundColor = '#fff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // Redraw all strokes
  const redraw = (allStrokes: Stroke[]) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        for (const stroke of allStrokes) {
          if (stroke.points.length < 2) continue;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      }
    }
  };

  // Responsive: update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      redraw(strokes);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line
  }, [width, height, backgroundColor]);

  // Redraw when strokes change
  useEffect(() => {
    redraw(strokes);
    // eslint-disable-next-line
  }, [strokes, width, height, backgroundColor]);

  // Start drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawing(true);
    setLastPoint({ x, y });
    setCurrentStroke({ points: [{ x, y }], color: penColor, width: penWidth });
  };

  // Draw line
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !lastPoint || !currentStroke) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = e.currentTarget.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setLastPoint({ x, y });
    setCurrentStroke({ ...currentStroke, points: [...currentStroke.points, { x, y }] });
  };

  // Stop drawing
  const handlePointerUp = () => {
    if (drawing && currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
      setRedoStack([]);
    }
    setDrawing(false);
    setLastPoint(null);
    setCurrentStroke(null);
  };

  // Clear canvas
  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
    }
  };

  // Undo
  const handleUndo = () => {
    if (strokes.length > 0) {
      setRedoStack(prev => [strokes[strokes.length - 1], ...prev]);
      setStrokes(prev => prev.slice(0, -1));
    }
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length > 0) {
      setStrokes(prev => [...prev, redoStack[0]]);
      setRedoStack(prev => prev.slice(1));
    }
  };

  // Export as PNG
  const handleExport = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'handwriting.png';
      link.click();
    }
  };

  // Export strokes as JSON
  const handleExportStrokes = () => {
    const data = JSON.stringify(strokes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'handwriting-strokes.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Initialize background
  useEffect(() => {
    handleClear();
    // eslint-disable-next-line
  }, [backgroundColor, width, height]);

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        tabIndex={0}
        aria-label="Handwriting input canvas"
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          background: backgroundColor,
          touchAction: 'none',
          width: '100%',
          maxWidth: width,
          height: 'auto',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleUndo} disabled={strokes.length === 0} style={{ marginRight: 8 }}>Undo</button>
        <button onClick={handleRedo} disabled={redoStack.length === 0} style={{ marginRight: 8 }}>Redo</button>
        <button onClick={handleClear} style={{ marginRight: 8 }}>Clear</button>
        <button onClick={handleExport} style={{ marginRight: 8 }}>Export as PNG</button>
        <button onClick={handleExportStrokes}>Export Strokes (JSON)</button>
      </div>
    </div>
  );
};

export default HandwritingInputCanvas; 