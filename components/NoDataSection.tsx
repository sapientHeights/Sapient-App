import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const NoDataSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather name="x-circle" size={34} color="#dc2626" />
        <Text style={styles.text}>No Data Available</Text>
      </View>
    </View>
  );
};

export default NoDataSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2', // light red background
    borderRadius: 32,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8, // RN 0.71+ supports gap
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 6,
    textAlign: 'center',
  },
});
