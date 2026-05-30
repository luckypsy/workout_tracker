export const SESSION_CONFIG = {
  '1-1': {
    name: '하체/어깨 스트렝스',
    type: 'strength',
    restSeconds: 120,
    exercises: [
      {
        name: '스쿼트',
        sets: [
          ...Array(3).fill(null).map((_, i) => ({ set_type: 'warmup', set_number: i + 1, target_reps: 20 })),
          ...Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 5 })),
          { set_type: 'cooldown', set_number: 1, target_reps: null },
        ],
      },
      {
        name: '밀리터리프레스',
        sets: [
          ...Array(3).fill(null).map((_, i) => ({ set_type: 'warmup', set_number: i + 1, target_reps: 20 })),
          ...Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 5 })),
          { set_type: 'cooldown', set_number: 1, target_reps: null },
        ],
      },
    ],
  },
  '1-2': {
    name: '등/가슴 스트렝스',
    type: 'strength',
    restSeconds: 120,
    exercises: [
      {
        name: '풀업',
        sets: [{ set_type: 'main', set_number: 1, target_reps: null, weightless: true }],
      },
      {
        name: '데드리프트',
        sets: [
          ...Array(2).fill(null).map((_, i) => ({ set_type: 'warmup', set_number: i + 1, target_reps: 20 })),
          ...Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 5 })),
          { set_type: 'cooldown', set_number: 1, target_reps: null },
        ],
      },
      {
        name: '벤치프레스',
        sets: [
          ...Array(3).fill(null).map((_, i) => ({ set_type: 'warmup', set_number: i + 1, target_reps: 20 })),
          ...Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 5 })),
          { set_type: 'cooldown', set_number: 1, target_reps: null },
        ],
      },
    ],
  },
  '1-3': {
    name: '팔/어깨/복근 보디빌딩',
    type: 'bodybuilding',
    restSeconds: 60,
    exercises: [
      '바벨컬', '해머컬', '라잉트라이셉스익스텐션', '케이블푸쉬다운',
      '사이드레터럴레이즈', '원암펙덱리어델트', '행잉레그레이즈',
    ].map(name => ({
      name,
      sets: Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 30 })),
    })),
  },
  '1-4': {
    name: '러닝 40분',
    type: 'running',
    restSeconds: 0,
    exercises: [],
  },
  '1-5': {
    name: '러닝 40분',
    type: 'running',
    restSeconds: 0,
    exercises: [],
  },
  '2-1': {
    name: '하체/어깨 보디빌딩',
    type: 'bodybuilding',
    restSeconds: 60,
    exercises: [
      '레그익스텐션', '레그프레스', '머신숄더프레스', '비하인드숄더프레스',
    ].map(name => ({
      name,
      sets: Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 12 })),
    })),
  },
  '2-2': {
    name: '등/가슴 보디빌딩',
    type: 'bodybuilding',
    restSeconds: 60,
    exercises: [
      '풀업', '바벨로우', '시티드로우', '스미스프레스', '인클라인프레스', '푸쉬업',
    ].map(name => ({
      name,
      sets: Array(3).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 12 })),
    })),
  },
  '2-3': {
    name: '팔/어깨/복근 보디빌딩',
    type: 'bodybuilding',
    restSeconds: 60,
    exercises: [
      '바벨컬', '해머컬', '라잉트라이셉스익스텐션', '케이블푸쉬다운',
      '사이드레터럴레이즈', '원암펙덱리어델트', '행잉레그레이즈',
    ].map(name => ({
      name,
      sets: Array(5).fill(null).map((_, i) => ({ set_type: 'main', set_number: i + 1, target_reps: 30 })),
    })),
  },
  '2-4': {
    name: '러닝 40분',
    type: 'running',
    restSeconds: 0,
    exercises: [],
  },
  '2-5': {
    name: '러닝 40분',
    type: 'running',
    restSeconds: 0,
    exercises: [],
  },
};

export const SESSION_ORDER = ['1-1','1-2','1-3','1-4','1-5','2-1','2-2','2-3','2-4','2-5'];

export function getNextSession(current) {
  const idx = SESSION_ORDER.indexOf(current);
  return SESSION_ORDER[(idx + 1) % SESSION_ORDER.length];
}
