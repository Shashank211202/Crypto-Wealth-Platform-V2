import { useState, useCallback, useRef, useEffect } from 'react';

export const useMouseTracker = (canvasRef) => {
  const [mousePos, setMousePos] = useState(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    
    // Use RAF to throttle updates
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    });
  }, [canvasRef]);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { mousePos, handleMouseMove, handleMouseLeave };
};
