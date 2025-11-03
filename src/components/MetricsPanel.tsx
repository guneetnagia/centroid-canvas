import { Card } from '@/components/ui/card';

interface MetricsPanelProps {
  k: number;
  inertia: number;
  silhouette: number;
  iterations: number;
  numPoints: number;
}

export const MetricsPanel = ({ k, inertia, silhouette, iterations, numPoints }: MetricsPanelProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Clusters (K)</div>
        <div className="text-2xl font-bold text-primary">{k}</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Points</div>
        <div className="text-2xl font-bold">{numPoints}</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Inertia (SSE)</div>
        <div className="text-2xl font-bold text-accent">{inertia.toFixed(2)}</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Silhouette</div>
        <div className="text-2xl font-bold" style={{ 
          color: silhouette > 0.5 ? 'hsl(142, 76%, 36%)' : silhouette > 0.25 ? 'hsl(47, 96%, 53%)' : 'hsl(0, 84%, 60%)'
        }}>
          {silhouette.toFixed(3)}
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Iterations</div>
        <div className="text-2xl font-bold">{iterations}</div>
      </Card>
    </div>
  );
};
