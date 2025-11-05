import AsyncStorage from '@react-native-async-storage/async-storage';
import vicCoursesData from '@/data/vic_courses.json';

export type TeePars = {
  name: string;
  par: number[];
  yardage?: number[];
  strokeIndex?: number[];
  slope?: number;
};

export type VicCourse = {
  id: string;
  club: string;
  course: string;
  suburb: string;
  state: 'VIC';
  tees: TeePars[];
};

export type SavedCourseData = {
  courseId: string;
  teeName: string;
  timestamp: string;
};

const STORAGE_KEY_LAST_COURSE = '@last_used_course';

class CourseService {
  private courses: VicCourse[] = vicCoursesData as VicCourse[];

  async listVicCourses(query?: string): Promise<VicCourse[]> {
    if (!query || query.trim() === '') {
      return this.courses;
    }

    const lowerQuery = query.toLowerCase();
    return this.courses.filter(
      (course) =>
        course.club.toLowerCase().includes(lowerQuery) ||
        course.course.toLowerCase().includes(lowerQuery) ||
        course.suburb.toLowerCase().includes(lowerQuery)
    );
  }

  async getCourseById(id: string): Promise<VicCourse | null> {
    const course = this.courses.find((c) => c.id === id);
    return course || null;
  }

  getPars(course: VicCourse, teeName: string): number[] {
    const tee = course.tees.find((t) => t.name === teeName);
    if (!tee) {
      return course.tees[0]?.par || [];
    }
    return tee.par;
  }

  getTotalPar(course: VicCourse, teeName: string): number {
    const pars = this.getPars(course, teeName);
    return pars.reduce((sum, par) => sum + par, 0);
  }

  getTee(course: VicCourse, teeName: string): TeePars | null {
    return course.tees.find((t) => t.name === teeName) || null;
  }

  async saveLastUsedCourse(courseId: string, teeName: string): Promise<void> {
    try {
      const data: SavedCourseData = {
        courseId,
        teeName,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY_LAST_COURSE, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving last used course:', error);
    }
  }

  async getLastUsedCourse(): Promise<SavedCourseData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_LAST_COURSE);
      if (data) {
        return JSON.parse(data) as SavedCourseData;
      }
    } catch (error) {
      console.error('Error getting last used course:', error);
    }
    return null;
  }

  async clearLastUsedCourse(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_LAST_COURSE);
    } catch (error) {
      console.error('Error clearing last used course:', error);
    }
  }
}

export const courseService = new CourseService();
