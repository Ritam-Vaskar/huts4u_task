import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { BookOpen, Download, ExternalLink, Search } from 'lucide-react';

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
        <div className="bg-blue-100 rounded-full p-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Library</h2>
          <p className="text-gray-600 text-sm">{filteredResources.length} approved resources available</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="doc">Documents</option>
          <option value="ppt">Presentations</option>
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No resources found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back later for new resources'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium uppercase">
                      {resource.file_type}
                    </span>
                    <span>{formatFileSize(resource.file_size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
                <a
                  href={resource.file_url}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-3 text-xs text-gray-400 text-center">
                Uploaded {new Date(resource.uploaded_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
