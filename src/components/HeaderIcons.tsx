import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

interface HeaderIconProps {
  color: string;
  size?: number;
}

function IconWrap({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

export function SignOutIcon({ color, size = 20 }: HeaderIconProps) {
  return (
    <IconWrap size={size}>
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrap>
  );
}
