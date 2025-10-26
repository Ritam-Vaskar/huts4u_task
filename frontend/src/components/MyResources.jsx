import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Package, Eye, Download, Star } from 'lucide-react';

export function MyResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const formatCount = (count) => {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    if (count < 1000000) return Math.floor(count / 1000) + 'k';
    return (count / 1000000).toFixed(1) + 'M';
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
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your resources...</p>
        </div>
      </div>
    );
  }

  const pendingCount = resources.filter(r => r.status === 'pending').length;
  const approvedCount = resources.filter(r => r.status === 'approved').length;
  const rejectedCount = resources.filter(r => r.status === 'rejected').length;

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.status === filter);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 card-hover border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 card-hover border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{approvedCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 sm:p-6 card-hover border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{rejectedCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 sm:p-8 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-3 shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Uploads</h2>
              <p className="text-gray-600 text-sm sm:text-base">{filteredResources.length} resources</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-16 animate-scaleIn">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No resources found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter === 'all' 
                ? 'Upload your first resource to get started'
                : `No ${filter} resources yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredResources.map((resource, index) => (
              <div
                key={resource.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-xl transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                    )}
                    
                    {/* Statistics - Only show for approved resources */}
                    {resource.status === 'approved' && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
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
                      <span className="uppercase font-semibold px-2 py-1 bg-gray-100 rounded">{resource.file_type}</span>
                      <span>{formatFileSize(resource.file_size)}</span>
                      <span className="text-xs">{new Date(resource.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(resource.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
