import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const FileUpload = ({
  id,
  name,
  accept,
  required = false,
  onChange,
  label,
  error,
  disabled = false,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
  ariaInvalid,
  ariaDescribedby
}) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragError, setDragError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setDragError(t('file_upload.file_size_error', { size: Math.round(maxSize / 1024 / 1024) }));
      return;
    }

    // Validate file type
    if (accept && !accept.split(',').some(type => {
      const cleanType = type.trim();
      if (cleanType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(cleanType.toLowerCase());
      }
      return file.type.match(new RegExp(cleanType.replace('*', '.*')));
    })) {
      setDragError(t('file_upload.file_type_error', { types: accept }));
      return;
    }

    setSelectedFile(file);
    setDragError('');
    
    // Create a synthetic event for the onChange handler
    const syntheticEvent = {
      target: {
        name,
        files: [file],
        type: 'file'
      }
    };
    onChange(syntheticEvent);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError('');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDragError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Create a synthetic event with no files
    const syntheticEvent = {
      target: {
        name,
        files: [],
        type: 'file'
      }
    };
    onChange(syntheticEvent);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t('file_upload.bytes')}`;
    const k = 1024;
    const sizes = [t('file_upload.bytes'), t('file_upload.kb'), t('file_upload.mb'), t('file_upload.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (file.type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-base font-medium text-theme-text">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          onChange={handleInputChange}
          disabled={disabled}
          multiple={multiple}
          className="hidden"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
        />

        {/* Custom file upload area */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-theme-border hover:border-primary-400 hover:bg-theme-surface'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error || dragError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          `}
        >
          {selectedFile ? (
            // File selected state
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-theme-text truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-theme-text-muted">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="flex-shrink-0 p-1 text-theme-text-muted hover:text-red-500 transition-colors"
                title={t('file_upload.remove_file')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            // Empty state
            <div className="text-center">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-theme-surface">
                <svg className="w-6 h-6 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-theme-text mb-1">
                {isDragOver ? t('file_upload.drop_here') : t('file_upload.click_to_upload')}
              </p>
              <p className="text-xs text-theme-text-muted">
                {accept ? t('file_upload.accepted_formats', { formats: accept }) : t('file_upload.all_formats_accepted')}
              </p>
              <p className="text-xs text-theme-text-muted mt-1">
                {t('file_upload.max_size', { size: Math.round(maxSize / 1024 / 1024) })}
              </p>
            </div>
          )}
        </div>

        {/* Error messages */}
        {(error || dragError) && (
          <div className="text-red-500 text-xs mt-1" role="alert">
            {error || dragError}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 