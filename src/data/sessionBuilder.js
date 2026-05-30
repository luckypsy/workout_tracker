import { SESSION_CONFIG } from './workoutConfig';
import { getLastSessionByKey } from './storage';

export function buildNewSession(sessionKey) {
  const config = SESSION_CONFIG[sessionKey];
  const prev = getLastSessionByKey(sessionKey);
  const [week, day] = sessionKey.split('-').map(Number);

  const exercises = config.exercises.map(exConfig => {
    const prevExercise = prev?.exercises?.find(e => e.name === exConfig.name);

    const sets = exConfig.sets.map((setConfig, idx) => {
      const prevSet = prevExercise?.sets?.[idx];
      let targetWeight = prevSet?.target_weight ?? null;
      let targetReps = setConfig.target_reps ?? prevSet?.target_reps ?? null;

      // Cooldown: auto-calc 50% of main set weight from current session (will be updated at runtime)
      if (setConfig.set_type === 'cooldown' && prevExercise) {
        const prevMain = prevExercise.sets.filter(s => s.set_type === 'main');
        const prevMainWeight = prevMain.length > 0 ? prevMain[0].target_weight : null;
        if (prevMainWeight) targetWeight = Math.round(prevMainWeight * 0.5 / 2.5) * 2.5;
      }

      return {
        set_type: setConfig.set_type,
        set_number: setConfig.set_number,
        target_weight: targetWeight,
        target_reps: targetReps,
        actual_reps: null,
        is_completed: false,
        is_pr: false,
        weightless: setConfig.weightless || false,
      };
    });

    return { name: exConfig.name, sets };
  });

  return {
    id: `${sessionKey}_${Date.now()}`,
    session_key: sessionKey,
    cycle_week: week,
    cycle_day: day,
    date: new Date().toISOString().split('T')[0],
    memo: '',
    completed: false,
    exercises,
  };
}
