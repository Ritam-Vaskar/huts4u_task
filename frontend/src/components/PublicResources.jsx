import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { BookOpen, Download, ExternalLink, Search, Filter, FileText, Image, FileCode, Presentation } from 'lucide-react';

export function PublicResources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchApprovedResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, filterType, resources]);

  const fetchApprovedResources = async () => {
    try {
      const response = await resourceAPI.getApprovedResources();
      setResources(response.data.resources || []);
      setFilteredResources(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(resource => resource.file_type === filterType);
    }

    setFilteredResources(filtered);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'doc':
        return <FileCode className="w-5 h-5" />;
      case 'ppt':
        return <Presentation className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'doc':
        return 'bg-blue-100 text-blue-800';
      case 'ppt':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 sm:p-8 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-3 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Resource Library</h2>
              <p className="text-gray-600 text-sm sm:text-base">{filteredResources.length} approved resources available</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            />
          </div>
          <div className="relative group sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white hover:border-gray-400 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="pdf">📄 PDF</option>
              <option value="image">🖼️ Images</option>
              <option value="doc">📝 Documents</option>
              <option value="ppt">📊 Presentations</option>
            </select>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-16 animate-scaleIn">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No resources found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back later for new resources'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredResources.map((resource, index) => (
              <div
                key={resource.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-xl transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getFileTypeColor(resource.file_type)}`}>
                    {getFileIcon(resource.file_type)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getFileTypeColor(resource.file_type)}`}>
                    {resource.file_type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t border-gray-100">
                  <span className="font-medium">{formatFileSize(resource.file_size)}</span>
                  <span className="text-xs">{new Date(resource.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/resources/${resource.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex-1 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <a
                    href={resource.file_url}
                    download
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow-md"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
