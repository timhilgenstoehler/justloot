import { CombatOverlay } from './CombatOverlay';
import { DefeatModal } from './DefeatModal';
import { RunResultModal } from './RunResultModal';
import { SalvageToast } from './SalvageToast';

/** Mounted once at app root so runs continue across tab navigation until loot is resolved. */
export function RunSessionOverlays() {
  return (
    <>
      <CombatOverlay />
      <DefeatModal />
      <RunResultModal />
      <SalvageToast />
    </>
  );
}
