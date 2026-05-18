import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { IconCamera, IconX } from '@tabler/icons';
import { useDropzone } from 'react-dropzone';

const SIZE = 120; // circle diameter in px

/**
 * ImageDropzone
 *
 * Props:
 *  - pendingFile  {File|null}   — controlled pending file from parent
 *  - onChange     {(File)=>void} — called when a new file is dropped/selected
 *  - existingBlobUrl {string|null} — blob URL of the already-saved photo (edit mode)
 *  - onDelete     {()=>void}    — called when the user clicks ✕ to remove the existing photo
 *  - pendingDelete {boolean}    — true when existing photo is staged for deletion
 */
const ImageDropzone = ({ pendingFile, onChange, existingBlobUrl, onDelete, pendingDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const objectUrlRef = useRef(null);

  // Create / revoke object URL whenever pendingFile changes
  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [pendingFile]);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 1,
    multiple: false,
  });

  // Determine what to show inside the circle
  const displayUrl = previewUrl || (!pendingDelete ? existingBlobUrl : null);
  const hasImage = Boolean(displayUrl);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE }}>
        {/* Circle dropzone */}
        <Box
          {...getRootProps()}
          sx={{
            width: SIZE,
            height: SIZE,
            borderRadius: '50%',
            border: isDragActive
              ? '2px solid'
              : hasImage
              ? '2px solid transparent'
              : '2px dashed',
            borderColor: isDragActive ? 'primary.main' : hasImage ? 'transparent' : 'grey.400',
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: hasImage ? 'transparent' : isDragActive ? 'action.hover' : 'grey.100',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: hasImage ? 'transparent' : 'action.hover' },
          }}
        >
          <input {...getInputProps()} />
          {hasImage ? (
            <Box
              component="img"
              src={displayUrl}
              alt="preview"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', px: 1 }}>
              <IconCamera size={28} color="#9e9e9e" />
              <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.2}>
                {isDragActive ? 'Drop here' : 'Upload photo'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ✕ button — remove pending file OR stage existing photo for deletion */}
        {hasImage && (
          <Tooltip title={previewUrl ? 'Remove selection' : 'Delete photo'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (previewUrl) {
                  onChange(null); // clear pending file in parent
                } else {
                  onDelete(); // stage existing photo for deletion
                }
              }}
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                bgcolor: 'error.main',
                color: '#fff',
                width: 22,
                height: 22,
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <IconX size={12} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Typography variant="caption" color="text.disabled">
        JPEG · PNG · GIF · max 5 MB
      </Typography>
    </Box>
  );
};

export default ImageDropzone;
