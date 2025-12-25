import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";

// Types
export type DocumentType = 'contract' | 'certificate' | 'permit' | 'ncts' | 'summary_declaration' | 'customs_correspondence' | 'e_document' | 'other';
export type DocumentStatus = 'valid' | 'expired' | 'expiring-soon' | 'draft';

export interface Document {
  id: number;
  title: string;
  type: DocumentType;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  customer?: { id: number; name: string };
  ship?: { id: number; name: string; imoNumber?: string };
  operation?: { id: number; name: string };
  issueDate?: string;
  expiryDate?: string;
  status: DocumentStatus;
  notes?: string;
  uploadedBy: { id: number; firstName: string; lastName: string; email: string; phone: string; photo?: string };
  createdAt: string;
  updatedAt: string;
}

interface GetDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  customerId?: number;
  shipId?: number;
  operationId?: number;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalDocuments: number;
  totalPages: number;
  searchQuery: string;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalDocuments: 0,
  totalPages: 1,
  searchQuery: '',
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// DOCUMENT THUNKS

export const getDocuments = createAsyncThunk("document/getDocuments", async (params: GetDocumentsParams, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search !== undefined && params.search !== null) {
      queryParams.append('search', params.search);
    }
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.customerId) queryParams.append('customerId', params.customerId.toString());
    if (params.shipId) queryParams.append('shipId', params.shipId.toString());
    if (params.operationId) queryParams.append('operationId', params.operationId.toString());

    const response = await api.get(`/document?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Belgeler yüklenirken bir hata oluştu" });
  }
});

export const getDocument = createAsyncThunk("document/getDocument", async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/document/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Belge yüklenirken bir hata oluştu" });
  }
});

export const createDocument = createAsyncThunk("document/createDocument", async (payload: { data: Partial<Document>; file: File }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', payload.file);
    
    // Append document data as JSON string
    const documentData = {
      title: payload.data.title,
      type: payload.data.type,
      documentNumber: payload.data.documentNumber,
      issueDate: payload.data.issueDate,
      expiryDate: payload.data.expiryDate,
      status: payload.data.status,
      notes: payload.data.notes,
      customerId: payload.data.customer?.id,
      shipId: payload.data.ship?.id,
      operationId: payload.data.operation?.id,
    };
    
    formData.append('title', documentData.title);
    formData.append('type', documentData.type);
    if (documentData.documentNumber) formData.append('documentNumber', documentData.documentNumber);
    if (documentData.issueDate) formData.append('issueDate', documentData.issueDate);
    if (documentData.expiryDate) formData.append('expiryDate', documentData.expiryDate);
    formData.append('status', documentData.status);
    if (documentData.notes) formData.append('notes', documentData.notes);
    if (documentData.customerId) formData.append('customerId', documentData.customerId.toString());
    if (documentData.shipId) formData.append('shipId', documentData.shipId.toString());
    if (documentData.operationId) formData.append('operationId', documentData.operationId.toString());

    const response = await api.post("/document", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Belge oluşturulurken bir hata oluştu" });
  }
});

export const updateDocument = createAsyncThunk("document/updateDocument", async (payload: { id: string; data: Partial<Document>; file?: File }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    
    if (payload.file) {
      formData.append('file', payload.file);
    }
    
    // Append document data
    const documentData = {
      title: payload.data.title,
      type: payload.data.type,
      documentNumber: payload.data.documentNumber,
      issueDate: payload.data.issueDate,
      expiryDate: payload.data.expiryDate,
      status: payload.data.status,
      notes: payload.data.notes,
      customerId: payload.data.customer?.id,
      shipId: payload.data.ship?.id,
      operationId: payload.data.operation?.id,
    };
    
    formData.append('title', documentData.title);
    formData.append('type', documentData.type);
    if (documentData.documentNumber) formData.append('documentNumber', documentData.documentNumber);
    if (documentData.issueDate) formData.append('issueDate', documentData.issueDate);
    if (documentData.expiryDate) formData.append('expiryDate', documentData.expiryDate);
    formData.append('status', documentData.status);
    if (documentData.notes) formData.append('notes', documentData.notes);
    if (documentData.customerId) formData.append('customerId', documentData.customerId.toString());
    if (documentData.shipId) formData.append('shipId', documentData.shipId.toString());
    if (documentData.operationId) formData.append('operationId', documentData.operationId.toString());

    const response = await api.put(`/document/${payload.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Belge güncellenirken bir hata oluştu" });
  }
});

export const deleteDocument = createAsyncThunk("document/deleteDocument", async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/document/${id}`);
    return { id: parseInt(id), ...response.data };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || { message: "Belge silinirken bir hata oluştu" });
  }
});

// SLICE

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    resetDocumentState: () => initialState,
  },
  extraReducers: (builder) => {
    // Get Documents
    builder.addCase(getDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getDocuments.fulfilled, (state, action) => {
      state.loading = false;
      state.documents = action.payload.documents || [];
      state.totalDocuments = action.payload.documentsCount || 0;
      state.totalPages = action.payload.totalPages || 1;
      state.page = action.payload.page || 1;
      state.limit = action.payload.limit || 10;
    });
    builder.addCase(getDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.message || "Belgeler yüklenemedi";
    });

    // Get Single Document
    builder.addCase(getDocument.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getDocument.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDocument = action.payload;
    });
    builder.addCase(getDocument.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.message || "Belge yüklenemedi";
    });

    // Create Document
    builder.addCase(createDocument.pending, (state) => {
      state.createLoading = true;
      state.error = null;
    });
    builder.addCase(createDocument.fulfilled, (state, action) => {
      state.createLoading = false;
      const document = action.payload.data || action.payload;
      state.documents.unshift(document);
      state.totalDocuments += 1;
      state.error = null;
    });
    builder.addCase(createDocument.rejected, (state, action) => {
      state.createLoading = false;
      state.error = (action.payload as any)?.message || "Belge oluşturulamadı";
    });

    // Update Document
    builder.addCase(updateDocument.pending, (state) => {
      state.updateLoading = true;
      state.error = null;
    });
    builder.addCase(updateDocument.fulfilled, (state, action) => {
      state.updateLoading = false;
      const document = action.payload.data || action.payload;
      const index = state.documents.findIndex(d => d.id === document.id);
      if (index !== -1) {
        state.documents[index] = document;
      }
      if (state.currentDocument?.id === document.id) {
        state.currentDocument = document;
      }
    });
    builder.addCase(updateDocument.rejected, (state, action) => {
      state.updateLoading = false;
      state.error = (action.payload as any)?.message || "Belge güncellenemedi";
    });

    // Delete Document
    builder.addCase(deleteDocument.pending, (state) => {
      state.deleteLoading = true;
      state.error = null;
    });
    builder.addCase(deleteDocument.fulfilled, (state, action) => {
      state.deleteLoading = false;
      state.documents = state.documents.filter(d => d.id !== action.payload.id);
      state.totalDocuments = Math.max(0, state.totalDocuments - 1);
      
      // Eğer sayfa boş kaldıysa ve birinci sayfa değilse, önceki sayfaya git
      if (state.documents.length === 0 && state.page > 1) {
        state.page -= 1;
      }
      
      if (state.currentDocument?.id === action.payload.id) {
        state.currentDocument = null;
      }
      
      state.error = null;
    });
    builder.addCase(deleteDocument.rejected, (state, action) => {
      state.deleteLoading = false;
      state.error = (action.payload as any)?.message || "Belge silinemedi";
    });
  },
});

export default documentSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetDocumentState } = documentSlice.actions;

