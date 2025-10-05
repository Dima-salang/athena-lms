import axios from 'axios';
import type { User, Student, Teacher } from './api';

const API_BASE_URL = '/api/auth';

export const login = async (credentials: Pick<User, 'username' | 'password'>): Promise<{ token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
};

export const registerStudent = async (student: Omit<Student, 'id'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/register/student`, student);
    return response.data;
};

export const registerTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/register/teacher`, teacher);
    return response.data;
};
