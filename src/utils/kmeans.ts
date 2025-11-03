export interface Point {
  x: number;
  y: number;
  cluster?: number;
}

export interface Centroid {
  x: number;
  y: number;
  cluster: number;
}

export interface KMeansResult {
  centroids: Centroid[];
  points: Point[];
  inertia: number;
  iterations: number;
}

export function distance(p1: Point, p2: Point | Centroid): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function initializeCentroids(points: Point[], k: number): Centroid[] {
  // K-means++ initialization
  const centroids: Centroid[] = [];
  
  // Pick first centroid randomly
  const firstIdx = Math.floor(Math.random() * points.length);
  centroids.push({ ...points[firstIdx], cluster: 0 });
  
  // Pick remaining centroids based on distance
  for (let i = 1; i < k; i++) {
    const distances = points.map(p => {
      const minDist = Math.min(...centroids.map(c => distance(p, c)));
      return minDist * minDist;
    });
    
    const sum = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sum;
    
    for (let j = 0; j < points.length; j++) {
      rand -= distances[j];
      if (rand <= 0) {
        centroids.push({ ...points[j], cluster: i });
        break;
      }
    }
  }
  
  return centroids;
}

export function assignClusters(points: Point[], centroids: Centroid[]): Point[] {
  return points.map(point => {
    let minDist = Infinity;
    let cluster = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = distance(point, centroid);
      if (dist < minDist) {
        minDist = dist;
        cluster = idx;
      }
    });
    
    return { ...point, cluster };
  });
}

export function updateCentroids(points: Point[], k: number): Centroid[] {
  const newCentroids: Centroid[] = [];
  
  for (let i = 0; i < k; i++) {
    const clusterPoints = points.filter(p => p.cluster === i);
    
    if (clusterPoints.length === 0) {
      // If cluster is empty, pick a random point
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      newCentroids.push({ ...randomPoint, cluster: i });
    } else {
      const x = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
      const y = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
      newCentroids.push({ x, y, cluster: i });
    }
  }
  
  return newCentroids;
}

export function calculateInertia(points: Point[], centroids: Centroid[]): number {
  return points.reduce((sum, point) => {
    const centroid = centroids[point.cluster || 0];
    const dist = distance(point, centroid);
    return sum + dist * dist;
  }, 0);
}

export function runKMeans(points: Point[], k: number, maxIterations: number = 100): KMeansResult {
  if (points.length < k) {
    throw new Error('Not enough points for the specified number of clusters');
  }
  
  let centroids = initializeCentroids(points, k);
  let assignedPoints = assignClusters(points, centroids);
  let iterations = 0;
  
  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const newCentroids = updateCentroids(assignedPoints, k);
    assignedPoints = assignClusters(assignedPoints, newCentroids);
    
    // Check convergence
    const hasConverged = centroids.every((oldCentroid, idx) => {
      const newCentroid = newCentroids[idx];
      return distance(oldCentroid, newCentroid) < 0.001;
    });
    
    centroids = newCentroids;
    
    if (hasConverged) break;
  }
  
  const inertia = calculateInertia(assignedPoints, centroids);
  
  return {
    centroids,
    points: assignedPoints,
    inertia,
    iterations
  };
}

export function calculateSilhouetteScore(points: Point[]): number {
  if (points.length === 0) return 0;
  
  const clusters = new Set(points.map(p => p.cluster));
  if (clusters.size <= 1) return 0;
  
  const silhouettes = points.map(point => {
    const cluster = point.cluster!;
    const sameCluster = points.filter(p => p.cluster === cluster);
    const otherClusters = [...clusters].filter(c => c !== cluster);
    
    // Calculate a(i) - mean distance to points in same cluster
    const a = sameCluster.length > 1
      ? sameCluster.reduce((sum, p) => sum + distance(point, p), 0) / (sameCluster.length - 1)
      : 0;
    
    // Calculate b(i) - mean distance to nearest cluster
    const b = Math.min(
      ...otherClusters.map(otherCluster => {
        const otherPoints = points.filter(p => p.cluster === otherCluster);
        return otherPoints.reduce((sum, p) => sum + distance(point, p), 0) / otherPoints.length;
      })
    );
    
    return (b - a) / Math.max(a, b);
  });
  
  return silhouettes.reduce((sum, s) => sum + s, 0) / silhouettes.length;
}

export function calculateSilhouetteScores(points: Point[]): { point: Point; score: number }[] {
  if (points.length === 0) return [];
  
  const clusters = new Set(points.map(p => p.cluster));
  if (clusters.size <= 1) return points.map(p => ({ point: p, score: 0 }));
  
  return points.map(point => {
    const cluster = point.cluster!;
    const sameCluster = points.filter(p => p.cluster === cluster);
    const otherClusters = [...clusters].filter(c => c !== cluster);
    
    const a = sameCluster.length > 1
      ? sameCluster.reduce((sum, p) => sum + distance(point, p), 0) / (sameCluster.length - 1)
      : 0;
    
    const b = otherClusters.length > 0
      ? Math.min(
          ...otherClusters.map(otherCluster => {
            const otherPoints = points.filter(p => p.cluster === otherCluster);
            return otherPoints.length > 0
              ? otherPoints.reduce((sum, p) => sum + distance(point, p), 0) / otherPoints.length
              : Infinity;
          })
        )
      : 0;
    
    const score = (b - a) / Math.max(a, b);
    return { point, score: isNaN(score) ? 0 : score };
  });
}
