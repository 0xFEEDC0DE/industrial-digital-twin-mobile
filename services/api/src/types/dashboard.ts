export interface PlantOverviewResponse {
  plants: PlantSummary[];
  summary: {
    plantCount: number;
    onlinePlantCount: number;
    totalActiveSimulations: number;
    totalEvaluationCount: number;
  };
}

export interface PlantSummary {
  plantId: string;
  status: 'online' | 'degraded' | 'offline';
  sceneCount: number;
  onlineScenes: number;
  activeSimulations: number;
  evaluationCount: number;
  tags: number;
  recentLifecycle: Array<{
    sceneId: string;
    source?: string;
    eventType?: string;
    timestamp?: string;
    payload?: Record<string, any>;
  }>;
}

export interface PlantDetailResponse {
  plantId: string;
  scenes: SceneRuntimeSummary[];
  summary: {
    sceneCount: number;
    onlineScenes: number;
    activeSimulations: number;
    evaluationCount: number;
  };
}

export interface SceneRuntimeSummary {
  sceneId: string;
  status: 'online' | 'offline' | 'unknown';
  activeSimulations: number;
  evaluations: Array<{
    scenarioId: string;
    sceneId: string;
    passed: boolean;
    score: number;
    completedAt: string;
    steps?: any[];
  }>;
  tags: Array<Record<string, any>>;
  lifecycle: Array<{
    sceneId: string;
    source?: string;
    eventType?: string;
    timestamp?: string;
    payload?: Record<string, any>;
  }>;
}
