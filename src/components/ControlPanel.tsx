import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  k: number;
  onKChange: (k: number) => void;
  onRunClustering: () => void;
  onReset: () => void;
  onGenerateSample: () => void;
  disabled?: boolean;
}

export const ControlPanel = ({
  k,
  onKChange,
  onRunClustering,
  onReset,
  onGenerateSample,
  disabled
}: ControlPanelProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Number of Clusters (K): <span className="text-primary font-bold">{k}</span>
          </label>
          <Slider
            value={[k]}
            onValueChange={(value) => onKChange(value[0])}
            min={2}
            max={8}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Adjust K to see how different numbers of clusters affect the results
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={onRunClustering} 
            disabled={disabled}
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Run K-Means
          </Button>
          
          <Button 
            onClick={onGenerateSample} 
            variant="secondary"
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Sample Data
          </Button>
          
          <Button 
            onClick={onReset} 
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Canvas
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-2">Instructions:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Click on canvas to add data points</li>
            <li>Or generate sample clustered data</li>
            <li>Adjust K (number of clusters)</li>
            <li>Run K-Means to see clustering</li>
            <li>Analyze metrics and charts below</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};
