import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography } from '@mui/material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

const FileDropzone = ({ onSave }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [isPDF, setIsPDF] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) {
      return;
    }
    
    const fileReader = new FileReader();

    fileReader.onload = function () {
      setFilePreview(fileReader.result);
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      <Typography variant="body1" align="center" sx={isDragActive ? activeTextStyles : textStyles}>
        {isDragActive
          ? 'Drop the files here ...'
          : "Drag 'n' drop some files here, or click to select files"}
      </Typography>
      {filePreview && (
        <div>
          {isPDF ? (
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>
              <Viewer fileUrl={filePreview} />
            </Worker>
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
