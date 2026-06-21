'use client';

import CharacterScreen from '../../../../../app/(tabs)/index';
import { GameScreen } from '@/lib/createGameScreen';

export default function PlayPage() {
  return <GameScreen Screen={CharacterScreen} />;
}
