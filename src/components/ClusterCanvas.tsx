import { useEffect, useRef } from 'react';
import { Point, Centroid } from '@/utils/kmeans';

interface ClusterCanvasProps {
  points: Point[];
  centroids: Centroid[];
  onAddPoint?: (point: Point) => void;
  width?: number;
  height?: number;
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(14, 90%, 65%)',
  'hsl(142, 76%, 36%)',
  'hsl(280, 85%, 60%)',
  'hsl(47, 96%, 53%)',
  'hsl(340, 82%, 52%)',
];

export const ClusterCanvas = ({ 
  points, 
  centroids, 
  onAddPoint,
  width = 800,
  height = 500
}: ClusterCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'hsl(214, 32%, 91%)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw points
    points.forEach(point => {
      const color = point.cluster !== undefined ? COLORS[point.cluster % COLORS.length] : 'hsl(215, 16%, 47%)';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw outline
      ctx.strokeStyle = 'hsl(0, 0%, 100%)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw centroids
    centroids.forEach(centroid => {
      const color = COLORS[centroid.cluster % COLORS.length];
      
      // Draw large X for centroid
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      const size = 15;
      
      ctx.beginPath();
      ctx.moveTo(centroid.x - size, centroid.y - size);
      ctx.lineTo(centroid.x + size, centroid.y + size);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centroid.x + size, centroid.y - size);
      ctx.lineTo(centroid.x - size, centroid.y + size);
      ctx.stroke();
      
      // Draw circle around centroid
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centroid.x, centroid.y, 20, 0, 2 * Math.PI);
      ctx.stroke();
    });
  }, [points, centroids, width, height]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onAddPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onAddPoint({ x, y });
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="border border-border rounded-lg shadow-lg cursor-crosshair bg-card"
    />
  );
};
