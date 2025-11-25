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
}

export interface EssayQuestion extends Question {
    questionAnswer: string;
    points: number;
}

export interface MultipleChoiceQuestion extends Question {
    options: Partial<Option>[];
    questionAnswer: string;
    correctAnswer: string;
}

export interface TrueFalseQuestion extends Question {
    trueFalseAnswer: string;
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
    section: Section;
    subject: Subject;
    questions: Question[];
}

export const getTeacherTests = async (teacherId: number): Promise<Test[]> => {
    const response = await axios.get(`${API_BASE_URL}/tests/${teacherId}/tests`);
    return response.data;
};

export const createTest = async (test: Omit<Test, 'teacher'> | Omit<Test, 'id' | 'teacher'>): Promise<Test> => {
    const response = await axios.post(`${API_BASE_URL}/tests`, test);
    return response.data;
};


/* TO-DO:
consolidate the createQuestion and bulkCreateQuestions into createQuestions api
use the options when creating the questions
*/


export const createQuestions = async (questions: Omit<Question, 'id'>[], options: Omit<Option, 'id'>[]): Promise<Question[]> => {
    const response = await axios.post(`${API_BASE_URL}/tests/questions`, questions, { params: { testId: questions[0].test.id, options } });
    return response.data;
};

export const getTestById = async (id: number): Promise<Test> => {
    const response = await axios.get(`${API_BASE_URL}/tests/${id}`);
    return response.data;
};


