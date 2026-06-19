import { CombatOverlay } from './CombatOverlay';
import { DefeatModal } from './DefeatModal';
import { PackRevealModal } from './PackRevealModal';
import { SalvageToast } from './SalvageToast';

/** Mounted once at app root so runs continue across tab navigation until loot is resolved. */
export function RunSessionOverlays() {
  return (
    <>
      <CombatOverlay />
      <DefeatModal />
      <PackRevealModal />
      <SalvageToast />
    </>
  );
}
