import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Eye, Save, Settings } from 'lucide-react';
import formService, { Question, CreateFormData } from '../services/formService';
import LoadingSpinner from '../components/LoadingSpinner';

const questionTypes = [
  { value: 'text', label: 'Short Answer' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

const FormBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateFormData>({
    title: 'Untitled Form',
    description: '',
    questions: [],
    collectEmail: false,
    allowMultipleResponses: true,
    settings: {
      backgroundColor: '#ffffff',
      headerColor: '#1976d2',
      showProgressBar: true,
    },
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    if (!id || id === 'new') return;
    
    setLoading(true);
    try {
      const response = await formService.getForm(id);
      setFormData(response.form);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id && id !== 'new') {
        await formService.updateForm(id, formData);
      } else {
        const response = await formService.createForm(formData);
        navigate(`/forms/${response.form._id}/edit`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: 'Untitled Question',
      required: false,
      options: [],
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId),
    });
  };

  const addOption = (questionId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption = {
      id: Date.now().toString(),
      text: `Option ${(question.options?.length || 0) + 1}`,
    };

    updateQuestion(questionId, {
      options: [...(question.options || []), newOption],
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options?.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const deleteOption = (questionId: string, optionId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options?.filter(opt => opt.id !== optionId),
    });
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id === 'new' ? 'Create Form' : 'Edit Form'}
          </h1>
          <p className="text-gray-600 mt-2">
            Build your form by adding questions and customizing settings.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {id && id !== 'new' && (
            <button
              onClick={() => navigate(`/forms/${id}/view`)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-2xl font-bold border-none outline-none focus:ring-0 p-0 placeholder-gray-400"
              placeholder="Form Title"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-none outline-none focus:ring-0 p-0 placeholder-gray-400 resize-none"
              placeholder="Form description (optional)"
              rows={2}
            />
          </div>
        </div>

        {/* Questions */}
        {formData.questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-2">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    className="flex-1 text-lg font-medium border-none outline-none focus:ring-0 p-0 placeholder-gray-400"
                    placeholder="Question"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {question.description && (
                  <input
                    type="text"
                    value={question.description}
                    onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                    className="w-full text-sm text-gray-600 border-none outline-none focus:ring-0 p-0 placeholder-gray-400"
                    placeholder="Help text (optional)"
                  />
                )}

                {/* Question Options */}
                {(question.type === 'multiple-choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          {question.type === 'multiple-choice' && (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                          )}
                          {question.type === 'checkbox' && (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                          )}
                          {question.type === 'dropdown' && (
                            <span className="text-gray-400">{option.id}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Option"
                        />
                        <button
                          onClick={() => deleteOption(question.id, option.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(question.id)}
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add option
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Question
        </button>

        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Form Settings
          </h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.collectEmail}
                onChange={(e) => setFormData({ ...formData, collectEmail: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Collect email addresses</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowMultipleResponses}
                onChange={(e) => setFormData({ ...formData, allowMultipleResponses: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow multiple responses per user</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
