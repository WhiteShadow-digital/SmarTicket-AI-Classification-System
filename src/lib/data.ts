/**
 * Data types for the ScholarVision (Student/Academic) and SalonSync (Inventory) modules.
 */

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
};

export type Student = {
  id: string;
  studentId: string;
  name: string;
  branch: string;
  grade: number;
  avatar: string;
  status: 'Registered' | 'Pending' | 'Inactive';
  fees: number;
  paid: number;
  discount: number;
  subjects: string[];
  attendance: number;
  teacherNotes: string;
};
