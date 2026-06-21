import type { Component, ComponentType, ReactElement } from 'react';

declare module 'react-native' {
  export const View: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const Pressable: ComponentType<any>;
  export const ScrollView: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const ActivityIndicator: ComponentType<any>;
  export const KeyboardAvoidingView: ComponentType<any>;
  export const Image: ComponentType<any>;

  export interface FlatListProps<ItemT> {
    data?: ReadonlyArray<ItemT>;
    renderItem?: (info: { item: ItemT; index: number }) => ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    style?: any;
    contentContainerStyle?: any;
    onContentSizeChange?: () => void;
    showsVerticalScrollIndicator?: boolean;
    [key: string]: any;
  }

  export class FlatList<ItemT = any> extends Component<FlatListProps<ItemT>> {
    scrollToEnd(options?: { animated?: boolean }): void;
    scrollToOffset(options: { offset: number; animated?: boolean }): void;
  }

  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
    flatten(style: any): any;
    absoluteFillObject: Record<string, any>;
    absoluteFill: Record<string, any>;
  };

  export const Platform: {
    OS: 'web' | 'ios' | 'android';
    select<T>(specifics: { web?: T; ios?: T; android?: T; default?: T }): T;
  };

  export const Alert: {
    alert(title: string, message?: string, buttons?: any[]): void;
  };

  export function useWindowDimensions(): {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
}
