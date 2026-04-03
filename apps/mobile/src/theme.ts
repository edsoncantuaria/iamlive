export const colors = {
  primaryGreen: '#4ECDC4',
  darkTeal: '#2C7A7B',
  warmGray: '#556270',
  softWhite: '#F7FFF7',
  offWhite: '#F0F4F0',
  dangerRed: '#E63946',
  warningAmber: '#F4A261',
  safeGreen: '#06D6A0',
  /** Inspirado em apps de bem-estar (tons quentes + lavanda suave) */
  fabulousLavender: '#B8A9D9',
  fabulousPeach: '#FFD8C9',
  fabulousDeep: '#4A4458',
} as const;

export const gradients = {
  safe: ['#4ECDC4', '#2AB7AD'] as const,
  warning: ['#F4A261', '#E76F51'] as const,
  critical: ['#E63946', '#C1121F'] as const,
  expired: ['#9D0208', '#6B0F1A'] as const,
  /** Fundos de tela — transição suave estilo “coach” */
  screenDawn: ['#FFF8F3', '#F3E8FF', '#E8F7F4'] as const,
  screenTwilight: ['#FDF6FF', '#FFEEF5', '#E6FAF7'] as const,
};
