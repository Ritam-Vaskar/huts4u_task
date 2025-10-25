import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { Shield, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';

export function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAllResources();
  }, []);

  const fetchAllResources = async () => {
    try {
      const response = await resourceAPI.getAllResources();
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resourceId) => {
    setActionLoading(resourceId);
    try {
      await resourceAPI.approveResource(resourceId);
      setResources(resources.map(r =>
        r.id === resourceId ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() } : r
      ));
    } catch (error) {
      console.error('Error approving resource:', error);
      alert('Failed to approve resource');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (resourceId) => {
    setActionLoading(resourceId);
    try {
      await resourceAPI.rejectResource(resourceId);
      setResources(resources.map(r =>
        r.id === resourceId ? { ...r, status: 'rejected', reviewed_at: new Date().toISOString() } : r
      ));
    } catch (error) {
      console.error('Error rejecting resource:', error);
      alert('Failed to reject resource');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (resource) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    setActionLoading(resource.id);
    try {
      await resourceAPI.deleteResource(resource.id);
      setResources(resources.filter(r => r.id !== resource.id));
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    } finally {
      setActionLoading(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Rejected
          </span>
        );
      default:
        return null;
    }
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

  const pendingResources = resources.filter(r => r.status === 'pending');
  const reviewedResources = resources.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 rounded-full p-3">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
            <p className="text-gray-600 text-sm">{pendingResources.length} resources awaiting approval</p>
          </div>
        </div>

        {pendingResources.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">All caught up!</p>
            <p className="text-gray-400 text-sm mt-2">No pending resources to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
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
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-yellow-200">
                  <button
                    onClick={() => handleApprove(resource.id)}
                    disabled={actionLoading === resource.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(resource.id)}
                    disabled={actionLoading === resource.id}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDelete(resource)}
                    disabled={actionLoading === resource.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviewed Resources</h2>

        {reviewedResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviewed resources yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewedResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
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
                  <div className="flex items-center gap-3">
                    {getStatusBadge(resource.status)}
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(resource)}
                    disabled={actionLoading === resource.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
