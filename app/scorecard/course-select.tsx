import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { Search, MapPin, ChevronRight, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { courseService, type VicCourse, type TeePars } from '@/lib/courseService';

export default function CourseSelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<VicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<VicCourse | null>(null);
  const [showTeeSelector, setShowTeeSelector] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadCourses(searchQuery);
  }, [searchQuery]);

  const loadCourses = async (query?: string) => {
    setLoading(true);
    try {
      const data = await courseService.listVicCourses(query);
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: VicCourse) => {
    setSelectedCourse(course);
    setShowTeeSelector(true);
  };

  const handleSelectTee = async (tee: TeePars) => {
    if (!selectedCourse) return;

    console.log('Tee selected:', selectedCourse.club, tee.name);
    await courseService.saveLastUsedCourse(selectedCourse.id, tee.name);
    
    setShowTeeSelector(false);
    router.back();
  };

  const renderCourseItem = ({ item }: { item: VicCourse }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => handleSelectCourse(item)}
    >
      <View style={styles.courseItemContent}>
        <View style={styles.courseItemMain}>
          <Text style={styles.courseName}>{item.club}</Text>
          {item.course !== item.club && (
            <Text style={styles.courseSubtitle}>{item.course}</Text>
          )}
          <View style={styles.courseLocation}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.courseSuburb}>{item.suburb}, VIC</Text>
          </View>
        </View>
        <View style={styles.courseItemRight}>
          <Text style={styles.teeCount}>{item.tees.length} tees</Text>
          <ChevronRight size={20} color={Colors.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTeeItem = ({ item }: { item: TeePars }) => {
    const totalPar = item.par.reduce((sum, p) => sum + p, 0);
    const totalYardage = item.yardage?.reduce((sum, y) => sum + y, 0);

    return (
      <TouchableOpacity
        style={styles.teeItem}
        onPress={() => handleSelectTee(item)}
      >
        <View style={styles.teeItemContent}>
          <View style={styles.teeItemLeft}>
            <View style={[styles.teeBadge, getTeeColor(item.name)]}>
              <View style={styles.teeBadgeInner} />
            </View>
            <View>
              <Text style={styles.teeName}>{item.name}</Text>
              <Text style={styles.teeDetails}>
                Par {totalPar}
                {totalYardage ? ` • ${totalYardage}m` : ''}
                {item.slope ? ` • Slope ${item.slope}` : ''}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.gold} />
        </View>
      </TouchableOpacity>
    );
  };

  const getTeeColor = (teeName: string) => {
    const name = teeName.toLowerCase();
    if (name.includes('championship') || name.includes('black')) {
      return { backgroundColor: '#1F2937' };
    }
    if (name.includes('blue')) {
      return { backgroundColor: '#3B82F6' };
    }
    if (name.includes('white')) {
      return { backgroundColor: '#E5E7EB' };
    }
    if (name.includes('red')) {
      return { backgroundColor: '#EF4444' };
    }
    return { backgroundColor: Colors.gold };
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Select Course',
          headerStyle: {
            backgroundColor: Colors.cardBackground,
          },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses by name or suburb..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} in Victoria
          </Text>
        </View>

        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MapPin size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                {loading ? 'Loading courses...' : 'No courses found'}
              </Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={showTeeSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Tee</Text>
            <TouchableOpacity onPress={() => setShowTeeSelector(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {selectedCourse && (
            <>
              <View style={styles.courseInfoCard}>
                <Text style={styles.courseInfoName}>{selectedCourse.club}</Text>
                <Text style={styles.courseInfoLocation}>
                  {selectedCourse.suburb}, VIC
                </Text>
              </View>

              <FlatList
                data={selectedCourse.tees}
                keyExtractor={(item) => item.name}
                renderItem={renderTeeItem}
                contentContainerStyle={styles.teeListContent}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingBottom: 24,
  },
  courseItem: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  courseItemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  courseItemMain: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
    color: Colors.gold,
    marginBottom: 6,
    fontWeight: '600' as const,
  },
  courseLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseSuburb: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  courseItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teeCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  courseInfoCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  courseInfoName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  courseInfoLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  teeListContent: {
    padding: 16,
  },
  teeItem: {
    backgroundColor: Colors.cardBackground,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  teeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  teeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  teeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teeBadgeInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
  },
  teeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  teeDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
