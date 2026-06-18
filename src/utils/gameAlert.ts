import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
};

export function gameAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const body = message ? `${title}\n\n${message}` : title;

  if (!buttons?.length) {
    window.alert(body);
    return;
  }

  if (buttons.length === 1) {
    window.alert(body);
    buttons[0].onPress?.();
    return;
  }

  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actions = buttons.filter((b) => b.style !== 'cancel');

  if (actions.length === 1) {
    if (window.confirm(body)) {
      actions[0].onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  window.alert(body);
  actions[0]?.onPress?.();
}
