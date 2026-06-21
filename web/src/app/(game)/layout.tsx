import { GameProviders } from '@/components/GameProviders';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <GameProviders>{children}</GameProviders>;
}
