import raw from './motivationalQuotes.json';

export type MotivationalQuote = {
  id: number;
  quote: string;
  author: string;
};

export const MOTIVATIONAL_QUOTES = raw as MotivationalQuote[];

export function randomMotivationalQuote(): MotivationalQuote {
  const i = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[i]!;
}
