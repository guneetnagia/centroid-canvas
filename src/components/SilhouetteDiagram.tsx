import { Card } from '@/components/ui/card';
import { calculateSilhouetteScores } from '@/utils/kmeans';
import { Point } from '@/utils/kmeans';

interface SilhouetteDiagramProps {
  points: Point[];
  k: number;
  averageScore: number;
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(14, 90%, 65%)',
  'hsl(142, 76%, 36%)',
  'hsl(280, 85%, 60%)',
  'hsl(47, 96%, 53%)',
  'hsl(340, 82%, 52%)',
];

export const SilhouetteDiagram = ({ points, k, averageScore }: SilhouetteDiagramProps) => {
  const scores = calculateSilhouetteScores(points);
  
  // Group by cluster and sort by score
  const clusteredScores: { [key: number]: { point: Point; score: number }[] } = {};
  for (let i = 0; i < k; i++) {
    clusteredScores[i] = scores
      .filter(s => s.point.cluster === i)
      .sort((a, b) => b.score - a.score);
  }

  const maxWidth = 400;
  let yOffset = 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Silhouette Diagram (K={k})
      </h3>
      <div className="relative" style={{ height: Math.max(300, points.length * 2 + 50) }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Average silhouette line */}
          <line
            x1={maxWidth / 2 + averageScore * (maxWidth / 2)}
            y1={0}
            x2={maxWidth / 2 + averageScore * (maxWidth / 2)}
            y2={points.length * 2}
            stroke="hsl(0, 84%, 60%)"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          
          {/* Cluster bars */}
          {Object.entries(clusteredScores).map(([cluster, clusterScores]) => {
            const clusterNum = parseInt(cluster);
            const startY = yOffset;
            
            const bars = clusterScores.map((item, idx) => {
              const barY = yOffset;
              yOffset += 2;
              
              const barWidth = (item.score * maxWidth) / 2;
              const barX = maxWidth / 2;
              
              return (
                <rect
                  key={`${clusterNum}-${idx}`}
                  x={item.score >= 0 ? barX : barX + barWidth}
                  y={barY}
                  width={Math.abs(barWidth)}
                  height={1.5}
                  fill={COLORS[clusterNum % COLORS.length]}
                  opacity={0.8}
                />
              );
            });
            
            yOffset += 10; // Gap between clusters
            
            return (
              <g key={clusterNum}>
                {bars}
                <text
                  x={10}
                  y={startY + (clusterScores.length * 2) / 2}
                  className="text-xs fill-muted-foreground"
                  dominantBaseline="middle"
                >
                  C{clusterNum}
                </text>
              </g>
            );
          })}
          
          {/* Axis */}
          <line
            x1={maxWidth / 2}
            y1={0}
            x2={maxWidth / 2}
            y2={points.length * 2}
            stroke="hsl(215, 16%, 47%)"
            strokeWidth={1}
          />
          
          {/* Scale labels */}
          <text x={maxWidth / 2 - maxWidth / 4} y={points.length * 2 + 20} className="text-xs fill-muted-foreground" textAnchor="middle">
            -0.5
          </text>
          <text x={maxWidth / 2} y={points.length * 2 + 20} className="text-xs fill-muted-foreground" textAnchor="middle">
            0
          </text>
          <text x={maxWidth / 2 + maxWidth / 4} y={points.length * 2 + 20} className="text-xs fill-muted-foreground" textAnchor="middle">
            0.5
          </text>
          <text x={maxWidth / 2 + maxWidth / 2} y={points.length * 2 + 20} className="text-xs fill-muted-foreground" textAnchor="middle">
            1.0
          </text>
        </svg>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Average Silhouette Score: <span className="font-semibold text-foreground">{averageScore.toFixed(3)}</span></p>
        <p className="text-xs mt-1">Red dashed line shows average. Wider bars = better clustering.</p>
      </div>
    </Card>
  );
};
