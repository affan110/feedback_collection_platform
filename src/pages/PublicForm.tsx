import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import formService, { Form, SubmitResponseData } from '../services/formService';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicForm: React.FC = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [respondentInfo, setRespondentInfo] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    if (!id) return;
    
    try {
      const response = await formService.getPublicForm(id);
      setForm(response.form);
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('Form not found or not published');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || [];
    if (checked) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: [...currentAnswers, optionId]
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: currentAnswers.filter((id: string) => id !== optionId)
      }));
    }
  };

  const validateForm = () => {
    if (!form) return false;

    for (const question of form.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setError(`Please answer: ${question.question}`);
          return false;
        }
      }
    }

    if (form.collectEmail && !respondentInfo.email) {
      setError('Email is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;

    setError('');
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const responseData: SubmitResponseData = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        })),
        respondentEmail: form.collectEmail ? respondentInfo.email : undefined,
        respondentName: respondentInfo.name || undefined,
      };

      await formService.submitResponse(id, responseData);
      setSubmitted(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mb-6">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.collectEmail && (
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={respondentInfo.email}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={respondentInfo.name}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            {form.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {question.description && (
                  <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                )}

                {question.type === 'text' && (
                  <input
                    type="text"
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Your answer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {question.type === 'textarea' && (
                  <textarea
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Your answer'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {question.type === 'email' && (
                  <input
                    type="email"
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'your.email@example.com'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {question.type === 'number' && (
                  <input
                    type="number"
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || '0'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {question.type === 'date' && (
                  <input
                    type="date"
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          required={question.required}
                          value={option.text}
                          checked={answers[question.id] === option.text}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'checkbox' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(answers[question.id] || []).includes(option.text)}
                          onChange={(e) => handleCheckboxChange(question.id, option.text, e.target.checked)}
                          className="mr-2 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'dropdown' && (
                  <select
                    required={question.required}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose an option</option>
                    {question.options?.map((option) => (
                      <option key={option.id} value={option.text}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;
