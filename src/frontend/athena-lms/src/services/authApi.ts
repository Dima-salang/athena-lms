import axios from 'axios';
import type { User, Student, Teacher } from './api';

const API_BASE_URL = '/api/auth';

export const login = async (credentials: Pick<User, 'username' | 'password'>): Promise<{ message: string, role: string }> => {
    // Use URLSearchParams for form-data which Spring Security expects by default for formLogin
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password || '');

    const response = await axios.post(`${API_BASE_URL}/login`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/logout`);
};

export const registerStudent = async (student: Omit<Student, 'id'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/register/student`, student);
    return response.data;
};

export const registerTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/register/teacher`, teacher);
    return response.data;
};
