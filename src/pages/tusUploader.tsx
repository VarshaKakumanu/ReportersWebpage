import React, { useState, ChangeEvent } from 'react';
import * as tus from 'tus-js-client';

interface FileUploadProps {
  onFileUpload: (fileInfo: { name: string; url: string } | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file.');
        return;
      }
      uploadFile(file);
    }
  };

  const uploadFile = (file: File) => {
    const upload = new tus.Upload(file, {
      endpoint: (window as any).UPLOAD_PATH || '/api/uploads/',
      onError(err) {
        console.error('Upload failed:', err);
        setUploadError(err instanceof Error ? err.message : 'Unknown error');
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setUploadProgress(parseFloat(percentage));
        console.log('Progress %s/%s, %s', bytesUploaded, bytesTotal, `${percentage}%`);
      },
      onSuccess() {
        console.log('Download %s from %s', (upload.file as File).name, upload.url);
        if (onFileUpload) {
            onFileUpload({ name: (upload.file as File).name, url: upload.url || '' });
          }
      },
    });

    upload.start();
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
      {uploadError && <div style={{ color: 'red' }}>Upload Error: {uploadError}</div>}
    </div>
  );
};

export default FileUpload;
