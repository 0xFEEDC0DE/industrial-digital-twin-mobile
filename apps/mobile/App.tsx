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
  name: string;
  status: string;
  progress: number;
  exportReady: boolean;
};

type TrainingModule = {
  id: string;
  title: string;
  environment: string;
  status: 'ready' | 'in-progress' | 'queued';
};

const scanModes: CaptureMode[] = ['Live camera', 'Preset video', 'Image set'];

const scenes: Scene[] = [
  { name: 'Compressor hall A', status: 'texturing active', progress: 82, exportReady: true },
  { name: 'Packaging line 3', status: 'scan in progress', progress: 48, exportReady: false },
  { name: 'Water treatment intake', status: 'training export ready', progress: 96, exportReady: true },
];

const trainingModules: TrainingModule[] = [
  { id: 'safety', title: 'Lockout / tagout walkthrough', environment: 'Factory floor', status: 'ready' },
  { id: 'inspection', title: 'Equipment inspection drill', environment: 'Maintenance bay', status: 'in-progress' },
  { id: 'startup', title: 'Startup procedure simulation', environment: 'Compressor room', status: 'queued' },
];

const exportTargets = ['glTF', 'USDZ', 'Gaussian Splat', 'AR / VR'];

export default function App() {
  const [selectedMode, setSelectedMode] = useState<CaptureMode>('Live camera');

  const activeScene = useMemo(() => {
    return scenes.find((scene) => scene.progress >= 80) ?? scenes[0];
  }, []);

  const handleModePress = (mode: CaptureMode) => {
    setSelectedMode(mode);
    Alert.alert('Capture flow selected', `${mode} was selected for the next scan job.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Industrial digital twin</Text>
          <Text style={styles.title}>Mobile scan studio</Text>
          <Text style={styles.subtitle}>
            Capture industrial scenes from mobile cameras, videos, or image sequences and convert them
            into textured 3D twins for training and maintenance.
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
          <Text style={styles.cardTitle}>Active scene</Text>
          <Text style={styles.sceneName}>{activeScene.name}</Text>
          <Text style={styles.sceneStatus}>{activeScene.status}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${activeScene.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{activeScene.progress}% complete</Text>
          <Text style={styles.exportHint}>
            {activeScene.exportReady ? 'Ready for export' : 'Processing scene export'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scene library</Text>
          {scenes.map((scene) => (
            <View key={scene.name} style={styles.sceneRow}>
              <View>
                <Text style={styles.sceneRowName}>{scene.name}</Text>
                <Text style={styles.sceneRowStatus}>{scene.status}</Text>
              </View>
              <Text style={styles.sceneRowPct}>{scene.progress}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Training modules</Text>
          {trainingModules.map((module) => (
            <View key={module.id} style={styles.trainingRow}>
              <View>
                <Text style={styles.trainingTitle}>{module.title}</Text>
                <Text style={styles.trainingMeta}>{module.environment}</Text>
              </View>
              <Text style={[styles.trainingBadge, module.status === 'ready' && styles.trainingBadgeReady]}>
                {module.status}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export targets</Text>
          <View style={styles.tagRow}>
            {exportTargets.map((target) => (
              <Text key={target} style={styles.tag}>
                {target}
              </Text>
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
  sceneName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  sceneStatus: {
    color: '#7dd3fc',
    marginTop: 6,
    marginBottom: 12,
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
  exportHint: {
    color: '#a7f3d0',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  sceneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2d39',
  },
  sceneRowName: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  sceneRowStatus: {
    color: '#7dd3fc',
    fontSize: 12,
    marginTop: 4,
  },
  sceneRowPct: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  trainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#162b3a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  trainingTitle: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  trainingMeta: {
    color: '#9fb6c6',
    fontSize: 12,
    marginTop: 4,
  },
  trainingBadge: {
    borderRadius: 999,
    backgroundColor: '#1f2f38',
    color: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 10,
    textTransform: 'capitalize',
    overflow: 'hidden',
  },
  trainingBadgeReady: {
    backgroundColor: '#166534',
    color: '#dcfce7',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: '#1f2f38',
    color: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 8,
  },
});

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""