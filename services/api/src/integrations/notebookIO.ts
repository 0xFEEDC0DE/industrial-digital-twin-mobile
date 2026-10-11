export async function publishSceneToNotebookIO(input: {
  projectName: string;
  sceneName: string;
  exportFormat: string;
}) {
  const response = {
    provider: 'notebookIO',
    status: 'queued',
    projectName: input.projectName,
    sceneName: input.sceneName,
    exportFormat: input.exportFormat,
  };

  return response;
}
