export async function syncScenarioToIOTraining(input: {
  title: string;
  environment: string;
  steps: string[];
}) {
  const response = {
    provider: 'io-training',
    status: 'queued',
    syncedTitle: input.title,
    environment: input.environment,
    stepCount: input.steps.length,
  };

  return response;
}
