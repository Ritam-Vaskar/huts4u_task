import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export function MyResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getMyResources();
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 rounded-full p-3">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">My Uploads</h2>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No resources uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first resource to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="uppercase font-medium">{resource.file_type}</span>
                    <span>{formatFileSize(resource.file_size)}</span>
                    <span>{new Date(resource.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>{getStatusBadge(resource.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
