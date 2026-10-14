import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type CaptureMode = 'Live camera' | 'Preset video' | 'Image set';

type Scene = {
  id: string;
  name: string;
  area: string;
  status: string;
  progress: number;
  exportReady: boolean;
  textureScore: number;
  gaussianReady: boolean;
  tags: string[];
};

type TrainingStep = {
  id: string;
  label: string;
  complete: boolean;
};

const scanModes: CaptureMode[] = ['Live camera', 'Preset video', 'Image set'];

const scenes: Scene[] = [
  {
    id: 'compressor-hall-a',
    name: 'Compressor hall A',
    area: 'Plant floor / compressor room',
    status: 'Texturing active',
    progress: 82,
    exportReady: true,
    textureScore: 92,
    gaussianReady: true,
    tags: ['compressor', 'safety zone', 'pipe run', 'valve stack'],
  },
  {
    id: 'packaging-line-3',
    name: 'Packaging line 3',
    area: 'Assembly / packaging',
    status: 'Scan in progress',
    progress: 48,
    exportReady: false,
    textureScore: 71,
    gaussianReady: false,
    tags: ['conveyor', 'inspection point', 'guard rail'],
  },
  {
    id: 'water-treatment-intake',
    name: 'Water treatment intake',
    area: 'Utility / treatment',
    status: 'Training export ready',
    progress: 96,
    exportReady: true,
    textureScore: 95,
    gaussianReady: true,
    tags: ['intake manifold', 'risk zone', 'utility corridor'],
  },
];

const trainingSteps: TrainingStep[] = [
  { id: 'inspect', label: 'Inspect machine state and hazard markers', complete: true },
  { id: 'lockout', label: 'Verify lockout / tagout and PPE status', complete: true },
  { id: 'operate', label: 'Start inspection routine', complete: false },
  { id: 'confirm', label: 'Confirm final condition and sign off', complete: false },
];

const exportFormats = ['glTF', 'USDZ', 'PLY', 'Gaussian Splat', 'WebXR'];

export default function App() {
  const [selectedMode, setSelectedMode] = useState<CaptureMode>('Live camera');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('compressor-hall-a');

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0],
    [selectedSceneId],
  );

  const handleModePress = (mode: CaptureMode) => {
    setSelectedMode(mode);
    Alert.alert('Capture flow selected', `${mode} was selected for the next scan job.`);
  };

  const handleExport = (format: string) => {
    Alert.alert('Export queued', `${format} export has been scheduled for ${selectedScene.name}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Industrial digital twin</Text>
          <Text style={styles.title}>Mobile scan studio</Text>
          <Text style={styles.subtitle}>
            Create textured industrial scenes from phone cameras, preset video, or image sets and use
            them for maintenance training and plant operations review.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a new capture</Text>
          {scanModes.map((mode) => {
            const isSelected = mode === selectedMode;
            return (
              <Pressable
                key={mode}
                onPress={() => handleModePress(mode)}
                style={[styles.modeButton, isSelected && styles.modeButtonSelected]}
              >
                <Text style={[styles.modeButtonText, isSelected && styles.modeButtonTextSelected]}>
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scene detail</Text>
          <View style={styles.sceneList}>
            {scenes.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setSelectedSceneId(scene.id)}
                style={[styles.sceneItem, scene.id === selectedSceneId && styles.sceneItemSelected]}
              >
                <Text style={styles.sceneItemTitle}>{scene.name}</Text>
                <Text style={styles.sceneItemMeta}>{scene.area}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sceneName}>{selectedScene.name}</Text>
          <Text style={styles.sceneInfo}>{selectedScene.area}</Text>
          <Text style={styles.sceneStatus}>{selectedScene.status}</Text>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${selectedScene.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{selectedScene.progress}% reconstruction complete</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Texture</Text>
              <Text style={styles.metricValue}>{selectedScene.textureScore}%</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Splat</Text>
              <Text style={styles.metricValue}>{selectedScene.gaussianReady ? 'Ready' : 'Queued'}</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {selectedScene.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Training workflow</Text>
          {trainingSteps.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={[styles.stepDot, step.complete && styles.stepDotComplete]} />
              <Text style={[styles.stepLabel, step.complete && styles.stepLabelComplete]}>{step.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export targets</Text>
          <View style={styles.exportRow}>
            {exportFormats.map((format) => (
              <Pressable key={format} onPress={() => handleExport(format)} style={styles.exportButton}>
                <Text style={styles.exportButtonText}>{format}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06151f',
  },
  container: {
    padding: 18,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#0d2434',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1b3b4d',
  },
  kicker: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#d7e3ec',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#0d1d2a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e2a39',
    padding: 18,
  },
  cardTitle: {
    color: '#e8f2f9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modeButton: {
    borderRadius: 12,
    backgroundColor: '#172c3d',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#243b50',
  },
  modeButtonSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#60a5fa',
  },
  modeButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  modeButtonTextSelected: {
    color: '#ffffff',
  },
  sceneList: {
    gap: 8,
    marginBottom: 12,
  },
  sceneItem: {
    borderRadius: 10,
    backgroundColor: '#152b39',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#213949',
  },
  sceneItemSelected: {
    backgroundColor: '#1e3a5f',
    borderColor: '#60a5fa',
  },
  sceneItemTitle: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  sceneItemMeta: {
    color: '#9fb6c6',
    fontSize: 12,
    marginTop: 4,
  },
  sceneName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  sceneInfo: {
    color: '#dbeafe',
    marginTop: 4,
  },
  sceneStatus: {
    color: '#7dd3fc',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#1f2f38',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  progressText: {
    color: '#dfeaf3',
    marginTop: 8,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#112838',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1b3347',
  },
  metricLabel: {
    color: '#9fb6c6',
    fontSize: 12,
  },
  metricValue: {
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: '#1f2f38',
    color: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#334155',
    marginRight: 10,
  },
  stepDotComplete: {
    backgroundColor: '#22c55e',
  },
  stepLabel: {
    color: '#dfeaf3',
    flexShrink: 1,
  },
  stepLabelComplete: {
    color: '#dcfce7',
    fontWeight: '700',
  },
  exportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  exportButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
});
