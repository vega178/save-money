import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getDocumentsByBillId, openDocumentInNewTab } from '../../../services/billsServices';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Fetch a document with the JWT and return a blob URL for in-page preview. */
const fetchBlobUrl = async (billId, docId) => {
  try {
    const token = sessionStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${baseURL}/bills/${billId}/documents/${docId}/view`, {
      headers: { Authorization: token || '' },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

const fmt = (n) =>
  n !== undefined && n !== null ? Number(n).toLocaleString('en-US') : '—';

// ── sub-component: one document card ─────────────────────────────────────────

const DocumentCard = ({ doc, billId }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPdf = doc.mimeType === 'application/pdf';

  useEffect(() => {
    let alive = true;
    fetchBlobUrl(billId, doc.id).then((url) => {
      if (alive) {
        setBlobUrl(url);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId, doc.id]);

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Preview area */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <CircularProgress size={28} />
        ) : blobUrl ? (
          isPdf ? (
            <iframe
              title={doc.originalName}
              src={blobUrl}
              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
            />
          ) : (
            <img
              src={blobUrl}
              alt={doc.originalName}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          )
        ) : (
          <FileIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
        )}

        {/* Open in new tab overlay button */}
        {blobUrl && (
          <Tooltip title="Open full view">
            <IconButton
              size="small"
              onClick={() => openDocumentInNewTab(billId, doc.id)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: 'rgba(255,255,255,0.85)',
                '&:hover': { background: 'white' },
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Metadata footer */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          title={doc.originalName}
        >
          {doc.originalName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {(doc.sizeBytes / 1024).toFixed(1)} KB ·{' '}
          {new Date(doc.uploadedAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const BillDetailsDialog = ({ isOpen, onClose, bill }) => {
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !bill?.id) {
      setDocuments([]);
      return;
    }
    setDocsLoading(true);
    getDocumentsByBillId(bill.id)
      .then((res) => setDocuments(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [isOpen, bill?.id]);

  if (!bill) return null;

  const fields = [
    { label: 'Date',             value: bill.billDate ? format(new Date(bill.billDate), 'yyyy-MM-dd') : '—' },
    { label: 'Amount',           value: fmt(bill.amount) },
    { label: 'Total Debt',       value: fmt(bill.totalDebt) },
    { label: 'Actual Debt',      value: fmt(bill.actualDebt) },
    { label: 'Total Balance',    value: fmt(bill.totalBalance) },
    { label: 'Remaining Amount', value: fmt(bill.remainingAmount) },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            {bill.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* ── Bill fields ─────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {fields.map(({ label, value }) => (
            <Grid item xs={6} sm={4} key={label}>
              <Typography variant="caption" color="text.secondary" display="block">
                {label}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {value}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* ── Documents section ───────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Documents
          </Typography>
          {!docsLoading && (
            <Chip
              label={documents.length === 0 ? 'None' : `${documents.length} file${documents.length > 1 ? 's' : ''}`}
              size="small"
              color={documents.length > 0 ? 'primary' : 'default'}
              variant="outlined"
            />
          )}
          {docsLoading && <CircularProgress size={16} />}
        </Box>

        {!docsLoading && documents.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No documents attached to this bill.
          </Typography>
        )}

        {documents.length > 0 && (
          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <DocumentCard doc={doc} billId={bill.id} />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillDetailsDialog;
