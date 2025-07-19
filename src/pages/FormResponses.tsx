
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Calendar } from 'lucide-react';
import formService, { FormResponse, Form } from '../services/formService';
import LoadingSpinner from '../components/LoadingSpinner';

const FormResponses: React.FC = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResponses();
    }
  }, [id]);

  const fetchResponses = async () => {
    if (!id) return;
    
    try {
      const response = await formService.getResponses(id);
      setForm(response.form);
      setResponses(response.responses);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || responses.length === 0) return;

    const headers = ['Submitted At', 'Respondent Email', 'Respondent Name'];
    form.questions.forEach(q => headers.push(q.question));

    const csvContent = [
      headers.join(','),
      ...responses.map(response => {
        const row = [
          new Date(response.submittedAt).toLocaleString(),
          response.respondentEmail || '',
          response.respondentName || ''
        ];
        
        form.questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          const answerText = answer ? 
            (Array.isArray(answer.answer) ? answer.answer.join('; ') : answer.answer) : '';
          row.push(`"${answerText}"`);
        });
        
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/forms"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-600 mt-2">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={responses.length === 0}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {responses.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  {form.collectEmail && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  )}
                  {form.questions.map((question) => (
                    <th
                      key={question.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {question.question}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(response.submittedAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(response.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    {form.collectEmail && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.respondentEmail || '-'}
                      </td>
                    )}
                    {form.questions.map((question) => {
                      const answer = response.answers.find(a => a.questionId === question.id);
                      return (
                        <td
                          key={question.id}
                          className="px-6 py-4 text-sm text-gray-900 max-w-xs"
                        >
                          <div className="truncate" title={answer?.answer?.toString()}>
                            {answer ? (
                              Array.isArray(answer.answer) ? 
                                answer.answer.join(', ') : 
                                answer.answer
                            ) : '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <Filter className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-600 mb-6">
            Share your form to start collecting responses.
          </p>
          <button
            onClick={() => {
              const link = `${window.location.origin}/form/${id}`;
              navigator.clipboard.writeText(link);
              alert('Form link copied to clipboard!');
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Copy Form Link
          </button>
        </div>
      )}
    </div>
  );
};

export default FormResponses;