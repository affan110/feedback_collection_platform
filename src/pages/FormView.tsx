
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, BarChart3, Share2 } from 'lucide-react';
import formService, { Form } from '../services/formService';
import LoadingSpinner from '../components/LoadingSpinner';

const FormView: React.FC = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    if (!id) return;
    
    try {
      const response = await formService.getForm(id);
      setForm(response.form);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyFormLink = () => {
    if (!id) return;
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  if (!form) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h2>
        <Link to="/forms" className="text-blue-600 hover:text-blue-700">
          Back to Forms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/forms"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Preview</h1>
            <p className="text-gray-600 mt-2">
              This is how your form will appear to respondents.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={copyFormLink}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <Link
            to={`/forms/${id}/responses`}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Responses ({form.responseCount || 0})
          </Link>
          <Link
            to={`/forms/${id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Form Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{form.title}</h2>
          {form.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}
          {!form.isPublished && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> This form is not published yet. Only you can see this preview.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
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
                  disabled
                  placeholder={question.placeholder || 'Your answer'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}

              {question.type === 'textarea' && (
                <textarea
                  disabled
                  placeholder={question.placeholder || 'Your answer'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}

              {question.type === 'email' && (
                <input
                  type="email"
                  disabled
                  placeholder={question.placeholder || 'your.email@example.com'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}

              {question.type === 'number' && (
                <input
                  type="number"
                  disabled
                  placeholder={question.placeholder || '0'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}

              {question.type === 'date' && (
                <input
                  type="date"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}

              {question.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        disabled
                        className="mr-2 text-blue-600"
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
                        disabled
                        className="mr-2 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'dropdown' && (
                <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <option>Choose an option</option>
                  {question.options?.map((option) => (
                    <option key={option.id} value={option.text}>
                      {option.text}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            disabled
            className="px-6 py-2 bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed"
          >
            Submit
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This is a preview. The submit button is disabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormView;