import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  academicData: {
    sessionId: string;
    studentClass: string;
    section: string;
    date: string;
  };
  attCount: number; // total students
};

const AttAcademicCard: React.FC<Props> = ({ academicData, attCount }) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Session */}
        <View style={[styles.card, { backgroundColor: '#dc2626', marginBottom: 10 }]}>
          <View style={styles.cardContent}>
            <Feather name="calendar" size={32} color="#fff" />
            <View style={styles.cardText}>
              <Text style={styles.label}>Session</Text>
              <Text style={styles.value}>{academicData.sessionId}</Text>
            </View>
          </View>
        </View>

        {/* Class */}
        <View style={[styles.card, { backgroundColor: '#16a34a', marginBottom: 10 }]}>
          <View style={styles.cardContent}>
            <Feather name="book" size={32} color="#fff" />
            <View style={styles.cardText}>
              <Text style={styles.label}>Class</Text>
              <Text style={styles.value}>{academicData.studentClass}</Text>
            </View>
          </View>
        </View>

        {/* Section */}
        <View style={[styles.card, { backgroundColor: '#2563eb' }]}>
          <View style={styles.cardContent}>
            <Feather name="layers" size={32} color="#fff" />
            <View style={styles.cardText}>
              <Text style={styles.label}>Section</Text>
              <Text style={styles.value}>{academicData.section}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          <Text style={styles.bold}>Total Students:</Text> {attCount}
        </Text>
        <Text style={styles.footerText}>
          <Text style={styles.bold}>Date:</Text> {academicData.date}
        </Text>
      </View>
    </View>
  );
};

export default AttAcademicCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  grid: {
    flexDirection: 'column',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 12,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 14,
    letterSpacing: 0.5,
    color: '#374151',
  },
  bold: {
    fontWeight: 'bold',
  },
});
