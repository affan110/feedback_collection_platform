import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Copy, BarChart3, Users } from 'lucide-react';
import formService, { Form } from '../services/formService';
import LoadingSpinner from '../components/LoadingSpinner';

const Forms: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await formService.getForms();
      setForms(response.forms);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await formService.deleteForm(id);
        setForms(forms.filter(form => form._id !== id));
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const response = await formService.togglePublish(id);
      setForms(forms.map(form => 
        form._id === id ? response.form : form
      ));
    } catch (error) {
      console.error('Error toggling form status:', error);
    }
  };

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your forms to collect responses from users.
          </p>
        </div>
        <Link
          to="/forms/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Link>
      </div>

      {forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {form.title}
                  </h3>
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {form.responseCount || 0} responses
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {form.questions.length} questions
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  form.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {form.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/forms/${form._id}/view`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/forms/${form._id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => copyFormLink(form._id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/forms/${form._id}/responses`}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="View Responses"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePublish(form._id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      form.isPublished
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {form.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first form to collect responses.
          </p>
          <Link
            to="/forms/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Form
          </Link>
        </div>
      )}
    </div>
  );
};

export default Forms;
