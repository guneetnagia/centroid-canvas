import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface ElbowChartProps {
  data: { k: number; inertia: number }[];
  optimalK?: number;
}

export const ElbowChart = ({ data, optimalK }: ElbowChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Elbow Method - Optimal K</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
          <XAxis 
            dataKey="k" 
            label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5 }}
            stroke="hsl(215, 16%, 47%)"
          />
          <YAxis 
            label={{ value: 'Inertia (SSE)', angle: -90, position: 'insideLeft' }}
            stroke="hsl(215, 16%, 47%)"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(214, 32%, 91%)',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="inertia" 
            stroke="hsl(217, 91%, 60%)" 
            strokeWidth={3}
            dot={{ fill: 'hsl(217, 91%, 60%)', r: 5 }}
          />
          {optimalK && (
            <ReferenceDot 
              x={optimalK} 
              y={data.find(d => d.k === optimalK)?.inertia || 0}
              r={8}
              fill="hsl(14, 90%, 65%)"
              stroke="hsl(0, 0%, 100%)"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {optimalK && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Optimal K detected at <span className="font-semibold text-accent">{optimalK}</span> (elbow point)
        </p>
      )}
    </Card>
  );
};
