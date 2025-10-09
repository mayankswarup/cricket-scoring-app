// Cricket shot types and regions for detailed ball-by-ball commentary

export const SHOT_TYPES = {
  DRIVES: [
    'Straight Drive',
    'Cover Drive',
    'Off Drive',
    'On Drive',
    'Square Drive',
  ],
  PULLS_HOOKS: [
    'Pull Shot',
    'Hook Shot',
    'Upper Cut',
  ],
  CUTS: [
    'Square Cut',
    'Late Cut',
    'Upper Cut',
  ],
  SWEEPS: [
    'Sweep',
    'Reverse Sweep',
    'Paddle Sweep',
    'Slog Sweep',
  ],
  LOFTED: [
    'Lofted Drive',
    'Lofted On Drive',
    'Lofted Cover Drive',
    'Chip Shot',
  ],
  DEFENSIVE: [
    'Forward Defense',
    'Back Defense',
    'Block',
  ],
  OTHER: [
    'Flick',
    'Glance',
    'Whip',
    'Dab',
    'Push',
    'Nudge',
    'Scoop',
    'Paddle',
  ],
};

export const SHOT_REGIONS = [
  'Long On',
  'Long Off',
  'Straight',
  'Mid On',
  'Mid Off',
  'Cover',
  'Extra Cover',
  'Point',
  'Backward Point',
  'Third Man',
  'Fine Leg',
  'Square Leg',
  'Mid Wicket',
  'Deep Mid Wicket',
  'Deep Square Leg',
  'Deep Fine Leg',
  'Deep Cover',
  'Deep Point',
];

export const SHOT_QUALITY = [
  'Perfect Timing',
  'Well Timed',
  'Good Shot',
  'Mistimed',
  'Edge',
  'Top Edge',
  'Bottom Edge',
  'Inside Edge',
  'Outside Edge',
  'Lucky',
];

// Flatten all shot types for easy selection
export const ALL_SHOT_TYPES = [
  ...SHOT_TYPES.DRIVES,
  ...SHOT_TYPES.PULLS_HOOKS,
  ...SHOT_TYPES.CUTS,
  ...SHOT_TYPES.SWEEPS,
  ...SHOT_TYPES.LOFTED,
  ...SHOT_TYPES.DEFENSIVE,
  ...SHOT_TYPES.OTHER,
];
