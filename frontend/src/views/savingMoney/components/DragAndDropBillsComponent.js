import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography } from '@mui/material';
import { pdfjs } from 'react-pdf';

const FileDropzone = ({ onSave }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [url, setUrl] = useState('');

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = function () {
      setFilePreview(fileReader.result);
      setUrl(URL.createObjectURL(file));
    };

    fileReader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log(data.message);

      onSave(file, fileReader.result);
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
    }
  }, [onSave]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.pdf, .xlsx',
    onDrop,
  });

  return (
    <div onChange={() => {}} {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      <Typography variant="body1" align="center" sx={isDragActive ? activeTextStyles : textStyles}>
        {isDragActive
          ? 'Drop the files here ...'
          : "Drag 'n' drop some files here, or click to select files"}
      </Typography>
      {filePreview && (
        <div style={{ height: '550px' }}>
          {url ? (
            <iframe title="PDF Preview" src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <img src={filePreview} alt="File Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )}
        </div>
      )}
    </div>
  );
};

const textStyles = {
  margin: '0',
};

const activeTextStyles = {
  color: '#2196F3',
};

const dropzoneStyles = {
  border: '2px dashed #aaa',
  padding: '20px',
  textAlign: 'center',
  width: '100%',
  height: '100%',
};

export default FileDropzone;