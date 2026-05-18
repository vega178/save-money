import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography } from '@mui/material';

/**
 * FileDropzone — accepts PDF and image files.
 *
 * NO longer uploads to a separate Express server.
 * It only buffers the selected File object locally and passes it up via
 * onSave(file) so the parent (BillForm) can upload it to the NestJS backend
 * after the bill has been created/updated (billId is required for the upload).
 *
 * Props:
 *   onSave(file)   — called with the File object when a file is dropped/selected
 *   pendingFile    — currently staged File (passed back down so the preview
 *                    survives parent re-renders without losing the selection)
 */
const FileDropzone = ({ onSave, pendingFile }) => {
  const [localUrl, setLocalUrl] = useState('');

  // Sync the local preview URL whenever the parent updates pendingFile
  useEffect(() => {
    if (pendingFile) {
      const objectUrl = URL.createObjectURL(pendingFile);
      setLocalUrl(objectUrl);
      // Revoke the previous URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLocalUrl('');
    }
  }, [pendingFile]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    // Pass the raw File up; BillForm will upload it to /api/bills/:id/documents
    onSave(file);
  }, [onSave]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] },
    onDrop,
    multiple: false,
  });

  return (
    <div onChange={() => {}} {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      <Typography variant="body1" align="center" sx={isDragActive ? activeTextStyles : textStyles}>
        {isDragActive
          ? 'Drop the file here ...'
          : pendingFile
          ? `Selected: ${pendingFile.name} — drop a new file to replace it`
          : "Drag 'n' drop a PDF or image, or click to select"}
      </Typography>
      {localUrl && (
        <div style={{ height: '550px', marginTop: '12px' }}>
          <iframe title="Preview" src={localUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
};

const textStyles = { margin: '0' };
const activeTextStyles = { color: '#2196F3' };
const dropzoneStyles = {
  border: '2px dashed #aaa',
  padding: '20px',
  textAlign: 'center',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
};

export default FileDropzone;