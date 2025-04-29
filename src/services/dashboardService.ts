import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { studentService, Student } from "./firebaseService";
import { courseService, Course } from "./firebaseService";
import { licenseService, License } from "./firebaseService";

// Interfaces for dashboard data
export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  upcomingExams: number;
  issuedLicenses: number;
}

export interface RecentExam {
  id: string;
  title: string;
  date: string;
  status: string;
}

export interface RecentLicense {
  id: string;
  studentName: string;
  licenseNumber: string;
  issueDate: string;
}

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Get all students
      const students = await studentService.getStudents();

      // Get all courses
      const courses = await courseService.getCourses();
      const activeCourses = courses.filter(
        (course) => course.status === "Đang diễn ra"
      );

      // Get upcoming exams
      const examsCollection = collection(db, "exams");
      const examsSnapshot = await getDocs(examsCollection);
      const exams = examsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const upcomingExams = exams.filter(
        (exam: any) =>
          exam.status === "Sắp diễn ra" || exam.status === "Đang diễn ra"
      );

      // Get issued licenses
      const licenses = await licenseService.getLicenses();
      const issuedLicenses = licenses.filter(
        (license) => license.status === "Đã cấp"
      );

      return {
        totalStudents: students.length,
        activeCourses: activeCourses.length,
        upcomingExams: upcomingExams.length,
        issuedLicenses: issuedLicenses.length,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values in case of error
      return {
        totalStudents: 0,
        activeCourses: 0,
        upcomingExams: 0,
        issuedLicenses: 0,
      };
    }
  },

  // Get recent exams
  getRecentExams: async (limit: number = 4): Promise<RecentExam[]> => {
    try {
      const examsCollection = collection(db, "exams");
      const examsSnapshot = await getDocs(examsCollection);
      const exams = examsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by date and take the most recent ones
      return exams
        .sort((a: any, b: any) => {
          const dateA = new Date(a.examDate).getTime();
          const dateB = new Date(b.examDate).getTime();
          return dateB - dateA;
        })
        .slice(0, limit)
        .map((exam: any) => ({
          id: exam.id,
          title: exam.title,
          date: exam.examDate,
          status: exam.status,
        }));
    } catch (error) {
      console.error("Error fetching recent exams:", error);
      return [];
    }
  },

  // Get recent licenses
  getRecentLicenses: async (limit: number = 4): Promise<RecentLicense[]> => {
    try {
      const licenses = await licenseService.getLicenses();

      // Sort by issue date and take the most recent ones
      return licenses
        .filter((license) => license.status === "Đã cấp" && license.issueDate)
        .sort((a, b) => {
          const dateA = new Date(a.issueDate).getTime();
          const dateB = new Date(b.issueDate).getTime();
          return dateB - dateA;
        })
        .slice(0, limit)
        .map((license) => ({
          id: license.id || "",
          studentName: license.studentName,
          licenseNumber: `GPLX ${license.licenseType} - ${
            license.id?.substring(0, 4) || ""
          }`,
          issueDate: license.issueDate,
        }));
    } catch (error) {
      console.error("Error fetching recent licenses:", error);
      return [];
    }
  },
};
