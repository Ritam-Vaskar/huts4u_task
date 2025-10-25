import { useState } from 'react';
import { resourceAPI } from '../api';
import { Upload, FileText, Image, FileType, Presentation, X } from 'lucide-react';

export function UploadResource() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getFileType = (mimeType) => {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    return null;
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'doc':
        return <FileType className="w-6 h-6" />;
      case 'ppt':
        return <Presentation className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const fileType = getFileType(selectedFile.type);
    if (!fileType) {
      setError('Invalid file type. Only PDF, images, DOC, and PPT files are allowed.');
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      await resourceAPI.uploadResource(formData);

      setSuccess('Resource uploaded successfully! Awaiting admin approval.');
      setTitle('');
      setDescription('');
      setFile(null);

      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 rounded-full p-3">
          <Upload className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Resource</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Resource Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Data Structures Notes - Chapter 5"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Provide details about this resource..."
          />
        </div>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              {file ? (
                <div className="flex items-center gap-3 text-gray-700">
                  {getFileIcon(getFileType(file.type))}
                  <span className="font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, PPT, or images up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
    </div>
  );
}
