/**
 * billsServices.js
 *
 * All paths are relative to the baseURL configured in api.js
 * (REACT_APP_API_URL or http://localhost:8080/api).
 *
 * The shared `api` instance handles:
 *   - Attaching the Authorization header automatically
 *   - Unwrapping the NestJS { success, data, timestamp } response envelope
 */
import api from './api';

export const getBills = async() => {
  try {
    return await api.get('/bills');
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const getBillsByUserId = async(userId) => {
  try {
    return await api.get(`/users/${userId}/bills`);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const createBillByUserId = async(userId,
  {
    billDate,
    name,
    amount,
    totalDebt,
    actualDebt,
    totalBalance,
    remainingAmount,
    gap,
    isChecked
}) => {
  try {
    return await api.post(
      `/users/${userId}/bills`,
      { billDate, name, amount, totalDebt, actualDebt, totalBalance, remainingAmount, gap, isChecked },
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const update = async({
  id,
  billDate,
  name,
  amount,
  totalDebt,
  actualDebt,
  totalBalance,
  remainingAmount,
  gap,
  isChecked
}) => {
  try {
    return await api.put(
      `/bills/${id}`,
      { billDate, name, amount, totalDebt, actualDebt, totalBalance, remainingAmount, gap, isChecked },
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const remove = async(id) => {
  try {
    return await api.delete(`/bills/${id}`);
  } catch (error) {

    console.log(error);
  }
}

export const reorderBills = async(orderedIds) => {
  try {
    return await api.put('/bills/reorder', orderedIds);
  } catch (error) {
    console.log(error);
  }
}

// ── Document endpoints ───────────────────────────────────────────────────────

/**
 * Upload a file and attach it to an existing bill.
 * Must be called AFTER the bill has been created so billId is known.
 */
export const uploadDocumentToBill = async (billId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = sessionStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${baseURL}/bills/${billId}/documents`, {
      method: 'POST',
      headers: { Authorization: token || '' },
      body: formData,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('uploadDocumentToBill error:', error);
    return null;
  }
};

/** Fetch the list of document metadata for a bill. */
export const getDocumentsByBillId = async (billId) => {
  try {
    return await api.get(`/bills/${billId}/documents`);
  } catch (error) {
    console.log(error);
    return [];
  }
};

/** Replace an existing document on a bill with a new file. */
export const replaceDocument = async (billId, docId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = sessionStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${baseURL}/bills/${billId}/documents/${docId}`, {
      method: 'PUT',
      headers: { Authorization: token || '' },
      body: formData,
    });
    if (!response.ok) throw new Error(`Replace failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('replaceDocument error:', error);
    return null;
  }
};

/** Delete a document from a bill. */
export const deleteDocument = async (billId, docId) => {
  try {
    return await api.delete(`/bills/${billId}/documents/${docId}`);
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * Fetch a document from the protected backend endpoint (with JWT),
 * convert it to a blob URL, and open it in a new browser tab.
 * This avoids the 401 that occurs when window.open() navigates directly
 * without an Authorization header.
 */
export const openDocumentInNewTab = async (billId, docId) => {
  try {
    const token = sessionStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${baseURL}/bills/${billId}/documents/${docId}/view`, {
      headers: { Authorization: token || '' },
    });
    if (!response.ok) throw new Error(`Failed to load document: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const tab = window.open(blobUrl, '_blank');
    // Revoke the blob URL after a short delay so memory isn't leaked
    if (tab) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }
  } catch (error) {
    console.error('openDocumentInNewTab error:', error);
  }
};