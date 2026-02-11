export type ThemeId = 'default' | 'light';

export interface Theme {
  id: ThemeId;
  name: string;
}

export const THEMES: Theme[] = [
  { id: 'default', name: 'Dark' },
  { id: 'light', name: 'Light' },
];
