import type {
  Scene,
  ReconstructionJob,
  SimulationJob,
  TrainingEvaluation,
  SceneArtifact,
} from '@industrial-digital-twin/shared';

export interface RuntimeState {
  sceneId: string;
  status: 'idle' | 'reconstructing' | 'simulating' | 'training' | 'ready';
  reconstructionJob?: ReconstructionJob;
  activeSimulations: SimulationJob[];
  evaluations: TrainingEvaluation[];
  artifacts: SceneArtifact[];
  lastUpdate: string;
}

export class RuntimeStore {
  private sceneStates: Map<string, RuntimeState> = new Map();
  private jobHistory: Map<string, (ReconstructionJob | SimulationJob)[]> = new Map();

  initializeScene(scene: Scene): RuntimeState {
    const state: RuntimeState = {
      sceneId: scene.id,
      status: 'ready',
      activeSimulations: [],
      evaluations: [],
      artifacts: scene.artifacts ?? [],
      lastUpdate: new Date().toISOString(),
    };
    this.sceneStates.set(scene.id, state);
    this.jobHistory.set(scene.id, []);
    return state;
  }

  getSceneState(sceneId: string): RuntimeState | undefined {
    return this.sceneStates.get(sceneId);
  }

  updateSceneState(sceneId: string, updates: Partial<RuntimeState>): RuntimeState | undefined {
    const state = this.sceneStates.get(sceneId);
    if (!state) return undefined;
    const updated = { ...state, ...updates, lastUpdate: new Date().toISOString() };
    this.sceneStates.set(sceneId, updated);
    return updated;
  }

  addReconstructionJob(sceneId: string, job: ReconstructionJob): void {
    const state = this.sceneStates.get(sceneId);
    if (!state) return;
    state.reconstructionJob = job;
    state.status = 'reconstructing';
    state.lastUpdate = new Date().toISOString();
    const history = this.jobHistory.get(sceneId) ?? [];
    history.push(job);
    this.jobHistory.set(sceneId, history);
  }

  addSimulation(sceneId: string, job: SimulationJob): void {
    const state = this.sceneStates.get(sceneId);
    if (!state) return;
    state.activeSimulations.push(job);
    if (state.status === 'idle') state.status = 'simulating';
    state.lastUpdate = new Date().toISOString();
    const history = this.jobHistory.get(sceneId) ?? [];
    history.push(job);
    this.jobHistory.set(sceneId, history);
  }

  updateSimulation(sceneId: string, jobId: string, updates: Partial<SimulationJob>): SimulationJob | undefined {
    const state = this.sceneStates.get(sceneId);
    if (!state) return undefined;
    const index = state.activeSimulations.findIndex((j) => j.id === jobId);
    if (index === -1) return undefined;
    const updated = { ...state.activeSimulations[index], ...updates };
    state.activeSimulations[index] = updated;
    state.lastUpdate = new Date().toISOString();
    if (updated.status === 'completed' || updated.status === 'failed') {
      state.activeSimulations.splice(index, 1);
      if (state.activeSimulations.length === 0) {
        state.status = 'ready';
      }
    }
    return updated;
  }

  addEvaluation(sceneId: string, evaluation: TrainingEvaluation): void {
    const state = this.sceneStates.get(sceneId);
    if (!state) return;
    state.evaluations.push(evaluation);
    state.lastUpdate = new Date().toISOString();
  }

  updateArtifacts(sceneId: string, artifacts: SceneArtifact[]): void {
    const state = this.sceneStates.get(sceneId);
    if (!state) return;
    state.artifacts = artifacts;
    const allReady = artifacts.every((a) => a.ready);
    if (allReady && state.status === 'reconstructing') {
      state.status = 'ready';
    }
    state.lastUpdate = new Date().toISOString();
  }

  getJobHistory(sceneId: string): (ReconstructionJob | SimulationJob)[] {
    return this.jobHistory.get(sceneId) ?? [];
  }

  getAllSceneStates(): RuntimeState[] {
    return Array.from(this.sceneStates.values());
  }

  getOperationalMetrics() {
    const states = Array.from(this.sceneStates.values());
    const activeSimulations = states.reduce((sum, state) => sum + state.activeSimulations.length, 0);
    const readyScenes = states.filter((state) => state.status === 'ready').length;
    const totalEvaluations = states.reduce((sum, state) => sum + state.evaluations.length, 0);

    return {
      totalScenes: states.length,
      readyScenes,
      activeSimulations,
      totalEvaluations,
      timestamp: new Date().toISOString(),
    };
  }
}

export const runtimeStore = new RuntimeStore();
