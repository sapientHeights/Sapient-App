import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
  icon?: React.ReactNode;
  text: string;
  setGreen?: boolean;
};

const Button: React.FC<Props> = ({ onPress, icon, text, setGreen = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, setGreen ? styles.greenButton : styles.redButton]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  greenButton: {
    backgroundColor: '#16a34a',
  },
  redButton: {
    backgroundColor: '#dc2626',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // RN 0.71+ supports gap, otherwise use margin
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
