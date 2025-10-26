import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { Shield, CheckCircle, XCircle, Trash2, ExternalLink, AlertTriangle, TrendingUp, Clock, FileCheck, Eye, Download, Star } from 'lucide-react';

export function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('pending');

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

  const formatCount = (count) => {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    if (count < 1000000) return Math.floor(count / 1000) + 'k';
    return (count / 1000000).toFixed(1) + 'M';
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
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

  const pendingResources = resources.filter(r => r.status === 'pending');
  const approvedResources = resources.filter(r => r.status === 'approved');
  const rejectedResources = resources.filter(r => r.status === 'rejected');

  const displayResources = filter === 'pending' ? pendingResources : 
                           filter === 'approved' ? approvedResources : 
                           rejectedResources;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 card-hover border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingResources.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 card-hover border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{approvedResources.length}</p>
            </div>
            <FileCheck className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 sm:p-6 card-hover border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{rejectedResources.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl p-6 sm:p-8 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-full p-3 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage and review resources</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending ({pendingResources.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Approved ({approvedResources.length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected ({rejectedResources.length})
            </button>
          </div>
        </div>

        {displayResources.length === 0 ? (
          <div className="text-center py-16 animate-scaleIn">
            {filter === 'pending' ? (
              <>
                <CheckCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">All caught up!</p>
                <p className="text-gray-400 text-sm mt-2">No pending resources to review</p>
              </>
            ) : (
              <>
                <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">No {filter} resources</p>
                <p className="text-gray-400 text-sm mt-2">No resources with this status yet</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {displayResources.map((resource, index) => (
              <div
                key={resource.id}
                className={`border rounded-xl p-5 hover:shadow-xl transition-all duration-300 card-hover ${
                  resource.status === 'pending' 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : resource.status === 'approved'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{resource.title}</h3>
                      {getStatusBadge(resource.status)}
                    </div>
                    {resource.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
                    )}
                    
                    {/* Statistics - Only show for approved resources */}
                    {resource.status === 'approved' && (
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1" title="Views">
                          <Eye className="w-4 h-4" />
                          <span>{formatCount(resource.view_count || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Downloads">
                          <Download className="w-4 h-4" />
                          <span>{formatCount(resource.download_count || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1" title={resource.average_rating && resource.average_rating > 0 ? `Average rating: ${Number(resource.average_rating).toFixed(1)}` : 'No ratings yet'}>
                          <Star className={`w-4 h-4 ${resource.average_rating && resource.average_rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          <span>{resource.average_rating && resource.average_rating > 0 ? Number(resource.average_rating).toFixed(1) : '0.0'}</span>
                          <span className="text-gray-400">({resource.rating_count || 0})</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="uppercase font-semibold px-2 py-1 bg-white rounded">{resource.file_type}</span>
                      <span>{formatFileSize(resource.file_size)}</span>
                      <span className="text-xs">{new Date(resource.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/resources/${resource.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View file"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                <div className={`flex flex-wrap items-center gap-2 sm:gap-3 pt-4 border-t ${
                  resource.status === 'pending' 
                    ? 'border-yellow-200' 
                    : resource.status === 'approved'
                    ? 'border-green-200'
                    : 'border-red-200'
                }`}>
                  {resource.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(resource.id)}
                        disabled={actionLoading === resource.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex-1 sm:flex-initial justify-center"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(resource.id)}
                        disabled={actionLoading === resource.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex-1 sm:flex-initial justify-center"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(resource)}
                    disabled={actionLoading === resource.id}
                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg ${
                      resource.status === 'pending' ? 'sm:ml-auto' : ''
                    } flex-1 sm:flex-initial justify-center`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
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
