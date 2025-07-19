import api from './api';

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple-choice' | 'checkbox' | 'dropdown' | 'email' | 'number' | 'date';
  question: string;
  required: boolean;
  options?: { id: string; text: string }[];
  placeholder?: string;
  description?: string;
}

export interface Form {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  isPublished: boolean;
  allowMultipleResponses: boolean;
  collectEmail: boolean;
  settings: {
    backgroundColor: string;
    headerColor: string;
    showProgressBar: boolean;
  };
  responseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  _id: string;
  form: string;
  answers: { questionId: string; answer: any }[];
  respondentEmail?: string;
  respondentName?: string;
  submittedAt: string;
}

export interface CreateFormData {
  title: string;
  description?: string;
  questions?: Question[];
  collectEmail?: boolean;
  allowMultipleResponses?: boolean;
  settings?: {
    backgroundColor?: string;
    headerColor?: string;
    showProgressBar?: boolean;
  };
}

export interface SubmitResponseData {
  answers: { questionId: string; answer: any }[];
  respondentEmail?: string;
  respondentName?: string;
}

class FormService {
  async getForms(page = 1, limit = 10) {
    const response = await api.get('/forms', { params: { page, limit } });
    return response.data;
  }

  async getForm(id: string) {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  }

  async getPublicForm(id: string) {
    const response = await api.get(`/forms/public/${id}`);
    return response.data;
  }

  async createForm(formData: CreateFormData) {
    const response = await api.post('/forms', formData);
    return response.data;
  }

  async updateForm(id: string, formData: Partial<CreateFormData>) {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  }

  async deleteForm(id: string) {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  }

  async togglePublish(id: string) {
    const response = await api.patch(`/forms/${id}/publish`);
    return response.data;
  }

  async submitResponse(formId: string, responseData: SubmitResponseData) {
    const response = await api.post(`/forms/${formId}/responses`, responseData);
    return response.data;
  }

  async getResponses(formId: string, page = 1, limit = 50) {
    const response = await api.get(`/forms/${formId}/responses`, { params: { page, limit } });
    return response.data;
  }
}

export default new FormService();
