import { View, Text, StyleSheet } from 'react-native';

export function TrainingStepProgress({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <View key={step} style={styles.row}>
            <View style={[styles.dot, isDone && styles.dotDone, isActive && styles.dotActive]} />
            <Text style={[styles.label, isDone && styles.labelDone, isActive && styles.labelActive]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#334155',
    marginRight: 10,
  },
  dotDone: {
    backgroundColor: '#22c55e',
  },
  dotActive: {
    backgroundColor: '#60a5fa',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  labelDone: {
    color: '#dcfce7',
  },
  labelActive: {
    color: '#eff6ff',
    fontWeight: '700',
  },
});
