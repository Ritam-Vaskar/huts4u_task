import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';
import { Heart, Download, ExternalLink, Search, FileText, Image, FileCode, Presentation, Eye, Star, Sparkles, X, MessageSquare } from 'lucide-react';
import axios from '../api/axios';
import { TagsDisplay } from './Tags';
import { RatingSection } from './Rating';

export function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, favorites]);

  const fetchFavorites = async () => {
    try {
      const response = await resourceAPI.getUserFavorites();
      setFavorites(response.data.favorites || []);
      setFilteredFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (resource, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedResource(resource);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedResource(null);
  };

  const handleRatingUpdate = async () => {
    // Refresh favorites to get updated ratings
    await fetchFavorites();
    // Update the selected resource with fresh data
    if (selectedResource) {
      const response = await resourceAPI.getUserFavorites();
      const updated = response.data.favorites.find(r => r.id === selectedResource.id);
      if (updated) {
        setSelectedResource(updated);
      }
    }
  };

  const filterFavorites = () => {
    if (!searchQuery) {
      setFilteredFavorites(favorites);
      return;
    }

    const filtered = favorites.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredFavorites(filtered);
  };

  const removeFavorite = async (resourceId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await resourceAPI.toggleFavorite(resourceId);
      setFavorites(prev => prev.filter(f => f.id !== resourceId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatCount = (count) => {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    if (count < 1000000) return Math.floor(count / 1000) + 'k';
    return (count / 1000000).toFixed(1) + 'M';
  };

  const handleDownload = async (resource) => {
    try {
      await axios.post(`/resources/${resource.id}/download`);
      window.open(resource.file_url, '_blank');
    } catch (error) {
      console.error('Error tracking download:', error);
      window.open(resource.file_url, '_blank');
    }
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl p-6 sm:p-8 card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-full p-3 shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Favorites</h2>
              <p className="text-gray-600 text-sm sm:text-base">{filteredFavorites.length} saved resources</p>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-pink-500 transition-colors" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>
          </div>
        )}

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16 animate-scaleIn">
            {favorites.length === 0 ? (
              <>
                <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">No favorites yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Start adding resources to your favorites by clicking the heart icon
                </p>
              </>
            ) : (
              <>
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">No matching favorites</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search query
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFavorites.map((resource, index) => (
              <div
                key={resource.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-pink-300 hover:shadow-xl transition-all duration-300 card-hover relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Favorite badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getFileTypeColor(resource.file_type)}`}>
                    {getFileIcon(resource.file_type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getFileTypeColor(resource.file_type)}`}>
                      {resource.file_type}
                    </span>
                    <button
                      onClick={(e) => removeFavorite(resource.id, e)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors group"
                      title="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover:fill-transparent transition-all" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
                )}

                {/* Tags Display */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mb-3">
                    <TagsDisplay tags={resource.tags} size="xs" maxDisplay={3} />
                  </div>
                )}

                {/* Statistics Row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1" title="Views">
                    <Eye className="w-4 h-4" />
                    <span>{formatCount(resource.view_count || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Downloads">
                    <Download className="w-4 h-4" />
                    <span>{formatCount(resource.download_count || 0)}</span>
                  </div>
                  <button
                    onClick={(e) => openRatingModal(resource, e)}
                    className="flex items-center gap-1 hover:text-yellow-600 transition-colors cursor-pointer"
                    title={resource.average_rating && resource.average_rating > 0 ? `Average rating: ${Number(resource.average_rating).toFixed(1)} - Click to rate` : 'No ratings yet - Be the first to rate!'}
                  >
                    <Star className={`w-4 h-4 ${resource.average_rating && resource.average_rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    <span>{resource.average_rating && resource.average_rating > 0 ? Number(resource.average_rating).toFixed(1) : '0.0'}</span>
                    <span className="text-gray-400">({resource.rating_count || 0})</span>
                  </button>
                  <button
                    onClick={(e) => openRatingModal(resource, e)}
                    className="flex items-center gap-1 hover:text-pink-600 transition-colors ml-auto text-pink-600"
                    title="View reviews and rate this resource"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Rate</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t border-gray-100">
                  <span className="font-medium">{formatFileSize(resource.file_size)}</span>
                  <span className="text-xs">{new Date(resource.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/resources/${resource.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all flex-1 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <button
                    onClick={() => handleDownload(resource)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow-md"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedResource && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeRatingModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-4 sm:p-6 flex items-center justify-between z-10 shadow-lg">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold line-clamp-2 mb-1">
                  {selectedResource.title}
                </h2>
                {selectedResource.description && (
                  <p className="text-sm text-pink-100 line-clamp-2">
                    {selectedResource.description}
                  </p>
                )}
              </div>
              <button
                onClick={closeRatingModal}
                className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <RatingSection 
                resource={selectedResource} 
                onRatingUpdate={handleRatingUpdate}
              />
            </div>

            {/* Modal Footer - Quick Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatCount(selectedResource.view_count || 0)} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{formatCount(selectedResource.download_count || 0)} downloads</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/resources/${selectedResource.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
