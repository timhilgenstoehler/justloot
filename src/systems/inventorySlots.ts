import type { Item, Slot } from '../types/game';

const RING_SLOTS: Slot[] = ['ring1', 'ring2'];
const TRINKET_SLOTS: Slot[] = ['trinket1', 'trinket2'];

export interface EquipSlotResolution {
  slot: Slot;
  needsSlotChoice: boolean;
  slotOptions?: Slot[];
}

function isRingSlot(slot: Slot): boolean {
  return slot === 'ring1' || slot === 'ring2';
}

function isTrinketSlot(slot: Slot): boolean {
  return slot === 'trinket1' || slot === 'trinket2';
}

export function getSlotGroup(slot: Slot): Slot | 'ring' | 'trinket' {
  if (isRingSlot(slot)) return 'ring';
  if (isTrinketSlot(slot)) return 'trinket';
  return slot;
}

export function resolveEquipSlot(
  item: Pick<Item, 'slot'>,
  equipment: Partial<Record<Slot, Item>>,
  preferredSlot?: Slot,
): EquipSlotResolution {
  if (isRingSlot(item.slot)) {
    if (preferredSlot && isRingSlot(preferredSlot)) {
      return { slot: preferredSlot, needsSlotChoice: false };
    }
    const empty = RING_SLOTS.find((s) => !equipment[s]);
    if (empty) return { slot: empty, needsSlotChoice: false };
    return { slot: 'ring1', needsSlotChoice: true, slotOptions: RING_SLOTS };
  }

  if (isTrinketSlot(item.slot)) {
    if (preferredSlot && isTrinketSlot(preferredSlot)) {
      return { slot: preferredSlot, needsSlotChoice: false };
    }
    const empty = TRINKET_SLOTS.find((s) => !equipment[s]);
    if (empty) return { slot: empty, needsSlotChoice: false };
    return { slot: 'trinket1', needsSlotChoice: true, slotOptions: TRINKET_SLOTS };
  }

  return { slot: item.slot, needsSlotChoice: false };
}
