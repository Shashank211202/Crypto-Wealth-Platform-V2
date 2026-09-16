import { useRef, useEffect, useState, useMemo } from 'react';
import { useChartMath } from './useChartMath';
import { useMouseTracker } from './useMouseTracker';
import { Loader2 } from 'lucide-react';

export const CryptoChartCanvas = ({ data, coin, color = '#10b981', loading }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { mousePos, handleMouseMove, handleMouseLeave } = useMouseTracker(canvasRef);
  
  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const math = useChartMath(data, dimensions.width, dimensions.height);
  
  // Find tooltip data
  const tooltipData = useMemo(() => {
    if (!mousePos || !math || !data) return null;
    const { fromPixelsX, toPixels } = math;
    
    const timeAtCursor = fromPixelsX(mousePos.x);
    
    // Find closest point
    let closest = data[0];
    let minDiff = Infinity;
    
    // Optimisation: Binary search could be better for large datasets, 
    // but for <1000 points linear is fine here.
    for (const point of data) {
      const diff = Math.abs(point.time - timeAtCursor);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    
    const coords = toPixels(closest.time, closest.price);
    return { ...closest, ...coords };
  }, [mousePos, math, data]);

  // Draw Function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !math || !data) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    const { toPixels, chartArea } = math; // minTime, maxTime, etc if needed

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid (Simple)
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal lines
    for (let i = 0; i < 5; i++) {
        const y = chartArea.top + (chartArea.height / 4) * i;
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
    }
    ctx.stroke();

    // Line Path
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    data.forEach((point, i) => {
      const { x, y } = toPixels(point.time, point.price);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, color + '33'); // 20% opacity
    gradient.addColorStop(1, color + '00'); // 0% opacity
    
    ctx.lineTo(toPixels(data[data.length-1].time, data[data.length-1].price).x, chartArea.bottom);
    ctx.lineTo(toPixels(data[0].time, data[0].price).x, chartArea.bottom);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Crosshair & Tooltip Highlight
    if (tooltipData) {
      const { x, y } = tooltipData;
      
      // Vertical line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#71717a';
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    }

  }, [dimensions, data, math, tooltipData, color]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-crypto-accent">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-[400px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block cursor-crosshair touch-none"
      />
      {tooltipData && (
        <div 
            className="absolute bg-zinc-900 border border-zinc-700 p-2 rounded shadow-xl text-xs pointer-events-none"
            style={{ 
              left: tooltipData.x, 
              top: tooltipData.y - 40,
              transform: 'translateX(-50%)'
            }}
        >
            <div className="text-gray-400">
                {new Date(tooltipData.time * 1000).toLocaleString()}
            </div>
            <div className="font-bold text-white">
                ${tooltipData.price.toFixed(2)}
            </div>
        </div>
      )}
      <div className="absolute top-4 left-4 font-bold text-2xl text-white">
          {coin} / USD
      </div>
    </div>
  );
};
