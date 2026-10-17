import React from 'react';
import { Modal, View, StyleSheet, Platform, ModalProps } from 'react-native';

export interface UniversalModalProps extends ModalProps {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export default function UniversalModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  statusBarTranslucent = true,
  ...props
}: UniversalModalProps) {
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={webStyles.overlay} {...(props as any)}>
        {children}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={onClose}
      {...props}
    >
      {children}
    </Modal>
  );
}

const webStyles = StyleSheet.create({
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
