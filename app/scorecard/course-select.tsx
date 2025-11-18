import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { Search, MapPin, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { courseService, type VicCourse } from '@/lib/courseService';

export default function CourseSelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<VicCourse[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSelectCourse = async (course: VicCourse) => {
    const defaultTee = course.tees.find(t => t.name.toLowerCase() === 'blue') || course.tees[0];
    
    if (defaultTee) {
      console.log('Auto-selected tee:', course.club, defaultTee.name);
      await courseService.saveLastUsedCourse(course.id, defaultTee.name);
      router.back();
    }
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
          <ChevronRight size={20} color={Colors.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );





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
});
