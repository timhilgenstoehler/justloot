import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

interface TabIconProps {
  color: string;
  size?: number;
}

function IconWrap({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <IconWrap size={size}>
      <Path
        d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5ZM5.5 19.5c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrap>
  );
}

export function InventoryTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <IconWrap size={size}>
      <Path
        d="M7 8.5V6.75A2.25 2.25 0 0 1 9.25 4.5h5.5A2.25 2.25 0 0 1 17 6.75V8.5M5.5 8.5h13l-1 11.25H6.5L5.5 8.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrap>
  );
}

export function CraftTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <IconWrap size={size}>
      <Path
        d="M14.5 5.5 18 9l-7.25 7.25a2.12 2.12 0 0 1-3 0l-.75-.75a2.12 2.12 0 0 1 0-3L14.5 5.5ZM6 18l-1.5 1.5M16.5 6.5l1-1"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrap>
  );
}

export function LeaderboardTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <IconWrap size={size}>
      <Path
        d="M7 20V11M12 20V4M17 20v-7"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 20h14"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </IconWrap>
  );
}
