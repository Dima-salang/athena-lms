import axios from 'axios';

const API_BASE_URL = '/api';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    password?: string; // Add password for registration
    role?: string;
}

export const getAllUsers = async (page: number = 0, size: number = 100, role?: string, search?: string): Promise<PaginatedResponse<User>> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { page, size, role, search }
    });
    return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/users/${id}`);
};

export const updateUser = async (user: User): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/users`, user);
};

export interface Teacher extends User { }

export interface Student extends User {
    lrn: number;
    section: Section;
}

export interface Section {
    id: number;
    name: string;
    adviserName?: string;
}

// ... (keep other interfaces)

export const getAllTeachers = async (page: number = 0, size: number = 100): Promise<PaginatedResponse<Teacher>> => {
    const response = await axios.get(`${API_BASE_URL}/admin/teachers`, {
        params: { page, size }
    });
    return response.data;
};

export const createSection = async (section: Omit<Section, 'id' | 'adviserName'>, teacherId?: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/sections`, section, { params: { teacherId } });
};

export interface Subject {
    id: number;
    name: string;
    description: string;
}

export interface TeacherAssignment {
    id: number;
    teacher: Teacher;
    section: Section;
    subject: Subject;
}

export const getAllTeacherAssignments = async (page: number = 0, size: number = 5): Promise<PaginatedResponse<TeacherAssignment>> => {
    const response = await axios.get(`${API_BASE_URL}/admin/teacher-assignments`, {
        params: { page, size }
    });
    return response.data;
};

export interface Question {
    id: number;
    tempId?: number;
    test: Test;
    questionNumber: string;
    questionText: string;
    questionType: string;
    fullPoints: number;
    correctPoints: number;
    isDirty?: boolean;
}

export interface EssayQuestion extends Question {
    questionAnswer: string;
    points: number;
}

export interface MultipleChoiceQuestion extends Question {
    options: Partial<Option>[];
    questionAnswer: string;
    correctAnswer: string;
    correctOptionId?: number;
}

export interface TrueFalseQuestion extends Question {
    trueFalseAnswer: string;
}

export interface IdentificationQuestion extends Question {
    correctAnswer: string;
}

export interface Option {
    id: number;
    tempId?: number;
    question: Question;
    test: Test;
    optionText: string;
}

export interface Test {
    id: number;
    testName: string;
    testDescription: string;
    testIssueDate: string; // LocalDateTime is serialized as string
    testDueDate: string;   // LocalDateTime is serialized as string
    testDuration: number;  // Duration is serialized as seconds (long)
    hasInfiniteTime: boolean;
    section: Section;
    subject: Subject;
    questions: Question[];
}

export interface StudentAnswer {
    id?: number;
    submission?: Submission;
    question: Question;
    optionId?: number;
    textAnswer?: string;
    points?: number;
}

export interface Submission {
    id: number;
    test: Test;
    student: Student;
    startTime: string;
    endTime?: string;
    totalScore?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

export const getTeacherTests = async (teacherId: number, page: number = 0, size: number = 5): Promise<PaginatedResponse<Test>> => {
    const response = await axios.get(`${API_BASE_URL}/teacher/tests/${teacherId}/tests`, {
        params: { page, size }
    });
    return response.data;
};

export const createTest = async (test: Omit<Test, 'teacher'> | Omit<Test, 'id' | 'teacher'>): Promise<Test> => {
    const response = await axios.post(`${API_BASE_URL}/teacher/tests`, test);
    console.log(response.data);
    return response.data;
};


/* TO-DO:
consolidate the createQuestion and bulkCreateQuestions into createQuestions api
use the options when creating the questions
*/


export const createQuestions = async (questions: Omit<Question, 'id'>[], options: Omit<Option, 'id'>[]): Promise<Question[]> => {
    const response = await axios.post(`${API_BASE_URL}/teacher/tests/questions`, questions, { params: { testId: questions[0].test.id, options } });
    return response.data;
};


export const getTestById = async (id: number): Promise<Test> => {
    const response = await axios.get(`${API_BASE_URL}/teacher/tests/${id}`);
    return response.data;
};

export const createOrUpdateQuestions = async (questions: Omit<Question, 'id'>[], testId: number): Promise<Question[]> => {
    const response = await axios.post(`${API_BASE_URL}/teacher/tests/autosave`, questions, { params: { testId } });
    console.log(response.data);
    return response.data;
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/teacher/tests/questions/${questionId}`);
};

export const autosaveTest = async (testId: number, test: Partial<Test>): Promise<Test> => {
    const response = await axios.post(`${API_BASE_URL}/teacher/tests/autosave/${testId}`, test);
    console.log("Called autosaveTest...")
    console.log(response.data)
    return response.data;
};

export const getSectionsTeacher = async (): Promise<Section[]> => {
    const response = await axios.get(`${API_BASE_URL}/teacher/tests/sections`);
    return response.data;
};

export const getSubjectsTeacher = async (): Promise<Subject[]> => {
    const response = await axios.get(`${API_BASE_URL}/teacher/tests/subjects`);
    return response.data;
};

// Admin API
export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/sections`);
    return response.data;
};

export const getSubjects = async (): Promise<Subject[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/subjects`);
    return response.data;
};







export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/subjects`, subject);
};

export const getAllSections = async (): Promise<Section[]> => {
    const response = await axios.get(`${API_BASE_URL}/auth/register/sections`);
    return response.data;
};

export const getTestsBySection = async (sectionId: number): Promise<Test[]> => {
    const response = await axios.get(`${API_BASE_URL}/student/tests/section/${sectionId}`);
    return response.data;
};

export const getStudentTestById = async (testId: number): Promise<Test> => {
    const response = await axios.get(`${API_BASE_URL}/student/tests/${testId}`);
    return response.data;
};

export const startTest = async (testId: number): Promise<Submission> => {
    const response = await axios.post(`${API_BASE_URL}/student/submissions/start/${testId}`);
    return response.data;
};

export const submitTest = async (submissionId: number, answers: StudentAnswer[]): Promise<Submission> => {
    const response = await axios.post(`${API_BASE_URL}/student/submissions/${submissionId}/finalize`, answers);
    return response.data;
};

export const updateAnswers = async (answers: StudentAnswer[]): Promise<StudentAnswer[]> => {
    const response = await axios.post(`${API_BASE_URL}/student/submissions/submit/update-answers`, answers);
    return response.data;
};

export const getStudentAnswers = async (submissionId: number): Promise<StudentAnswer[]> => {
    const response = await axios.get(`${API_BASE_URL}/student/submissions/${submissionId}/answers`);
    return response.data;
};

export const createAdmin = async (admin: User): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/admin/register/admin`, admin);
    return response.data;
};




export const createTeacherAssignment = async (assignment: Omit<TeacherAssignment, 'id'>): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/register/teacher-assignment`, assignment);
};

export const deleteTeacherAssignment = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/teacher-assignments`, { params: { id } });
};
