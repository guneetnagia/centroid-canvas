import { useState, useCallback } from 'react';
import { ClusterCanvas } from '@/components/ClusterCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ElbowChart } from '@/components/ElbowChart';
import { SilhouetteDiagram } from '@/components/SilhouetteDiagram';
import { Point, Centroid, runKMeans, calculateSilhouetteScore } from '@/utils/kmeans';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

const Index = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [inertia, setInertia] = useState(0);
  const [silhouette, setSilhouette] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [elbowData, setElbowData] = useState<{ k: number; inertia: number }[]>([]);
  const [optimalK, setOptimalK] = useState<number | undefined>();

  const handleAddPoint = useCallback((point: Point) => {
    setPoints(prev => [...prev, point]);
  }, []);

  const generateSampleData = useCallback(() => {
    const samples: Point[] = [];
    const numClusters = 3;
    const pointsPerCluster = 30;
    
    const clusterCenters = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 400, y: 350 }
    ];
    
    clusterCenters.forEach(center => {
      for (let i = 0; i < pointsPerCluster; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 80 + 20;
        samples.push({
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius
        });
      }
    });
    
    setPoints(samples);
    toast.success('Sample data generated!');
  }, []);

  const runClustering = useCallback(() => {
    if (points.length < k) {
      toast.error(`Need at least ${k} points for ${k} clusters`);
      return;
    }

    try {
      const result = runKMeans(points, k);
      setPoints(result.points);
      setCentroids(result.centroids);
      setInertia(result.inertia);
      setIterations(result.iterations);
      
      const silhouetteScore = calculateSilhouetteScore(result.points);
      setSilhouette(silhouetteScore);
      
      // Calculate elbow data
      const elbowResults: { k: number; inertia: number }[] = [];
      for (let testK = 2; testK <= Math.min(8, points.length - 1); testK++) {
        const testResult = runKMeans(points, testK);
        elbowResults.push({ k: testK, inertia: testResult.inertia });
      }
      setElbowData(elbowResults);
      
      // Find optimal K using elbow method
      if (elbowResults.length >= 3) {
        let maxCurvature = -Infinity;
        let optK = 2;
        
        for (let i = 1; i < elbowResults.length - 1; i++) {
          const p1 = elbowResults[i - 1];
          const p2 = elbowResults[i];
          const p3 = elbowResults[i + 1];
          
          const angle1 = Math.atan2(p2.inertia - p1.inertia, p2.k - p1.k);
          const angle2 = Math.atan2(p3.inertia - p2.inertia, p3.k - p2.k);
          const curvature = Math.abs(angle2 - angle1);
          
          if (curvature > maxCurvature) {
            maxCurvature = curvature;
            optK = p2.k;
          }
        }
        setOptimalK(optK);
      }
      
      toast.success(`Clustering complete! Converged in ${result.iterations} iterations`);
    } catch (error) {
      toast.error('Error running K-Means: ' + (error as Error).message);
    }
  }, [points, k]);

  const handleReset = useCallback(() => {
    setPoints([]);
    setCentroids([]);
    setInertia(0);
    setSilhouette(0);
    setIterations(0);
    setElbowData([]);
    setOptimalK(undefined);
    toast.info('Canvas cleared');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">K-Means Clustering</h1>
              <p className="text-muted-foreground">Interactive Machine Learning Algorithm Visualizer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column - Canvas and Charts */}
          <div className="space-y-6">
            {/* Canvas */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Interactive Canvas</h2>
                <p className="text-sm text-muted-foreground">Click to add data points, then run K-Means to see clusters form</p>
              </div>
              <ClusterCanvas
                points={points}
                centroids={centroids}
                onAddPoint={handleAddPoint}
              />
            </div>

            {/* Metrics */}
            {points.length > 0 && centroids.length > 0 && (
              <MetricsPanel
                k={k}
                inertia={inertia}
                silhouette={silhouette}
                iterations={iterations}
                numPoints={points.length}
              />
            )}

            {/* Charts */}
            {elbowData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                <ElbowChart data={elbowData} optimalK={optimalK} />
                {points.length > 0 && centroids.length > 0 && (
                  <SilhouetteDiagram points={points} k={k} averageScore={silhouette} />
                )}
              </div>
            )}

            {/* Educational Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-2 text-primary">Inertia (SSE)</h3>
                <p className="text-sm text-muted-foreground">
                  Sum of squared distances from points to their cluster centroids. Lower is better, but watch for overfitting.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-2 text-accent">Elbow Method</h3>
                <p className="text-sm text-muted-foreground">
                  Plot inertia vs K. The "elbow" point where decrease slows indicates optimal K value.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-2" style={{ color: 'hsl(142, 76%, 36%)' }}>Silhouette Score</h3>
                <p className="text-sm text-muted-foreground">
                  Measures how similar points are to their cluster vs other clusters. Range: -1 to 1. Higher is better.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-24 h-fit">
            <ControlPanel
              k={k}
              onKChange={setK}
              onRunClustering={runClustering}
              onReset={handleReset}
              onGenerateSample={generateSampleData}
              disabled={points.length < k}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
