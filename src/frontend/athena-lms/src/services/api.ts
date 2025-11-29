import axios from 'axios';

const API_BASE_URL = '/api';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    password?: string; // Add password for registration
}

export interface Teacher extends User { }

export interface Student extends User {
    lrn: number;
    section: Section;
}

export interface Section {
    id: number;
    name: string;
}

export interface Subject {
    id: number;
    name: string;
    description: string;
}

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

export const getTeacherTests = async (teacherId: number): Promise<Test[]> => {
    const response = await axios.get(`${API_BASE_URL}/teacher/tests/${teacherId}/tests`);
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

// Admin API
export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/sections`);
    return response.data;
};

export const getSubjects = async (): Promise<Subject[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/subjects`);
    return response.data;
};

export const createSection = async (section: Omit<Section, 'id'>): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/sections`, section);
};

export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/subjects`, subject);
};

export const getAllSections = async (): Promise<Section[]> => {
    const response = await axios.get(`${API_BASE_URL}/sections`);
    return response.data;
};

export const getTestsBySection = async (sectionId: number): Promise<Test[]> => {
    const response = await axios.get(`${API_BASE_URL}/student/tests/section/${sectionId}`);
    return response.data;
};

export const createAdmin = async (admin: User): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/admin/register/admin`, admin);
    return response.data;
};




