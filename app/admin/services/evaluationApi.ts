export interface InspectionCompletionEvaluationRequest {
  dossierId: number;
  inspectionNumber: string;
  evaluationDate?: string; // ISO date
  evaluatorUserId?: number;
  supervisorUserId?: number;
  status?: string;
  notes?: string;
}

export interface InspectionCompletionEvaluationResponse extends InspectionCompletionEvaluationRequest {
  evaluationId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationCategoryResponse {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  categoryOrder?: number;
  isActive?: boolean;
}

export type InputType = "CHECKBOX" | "TEXT" | "SELECT" | "DATE" | "NUMBER";

export interface EvaluationCriteriaResponse {
  criteriaId: number;
  categoryId: number;
  criteriaCode: string;
  criteriaOrder?: number;
  criteriaText: string;
  inputType?: InputType;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface EvaluationResultResponse {
  resultId: number;
  evaluationId: number;
  criteriaId: number;
  checkboxValue?: boolean;
  textValue?: string;
  numberValue?: number;
  dateValue?: string;
  selectValue?: string;
  notes?: string;
}

export type EvaluationResultRequest = Omit<EvaluationResultResponse, "resultId">;

export interface DossierDocumentTypeResponse {
  documentTypeId: number;
  typeCode: string;
  typeName: string;
  typeNameEnglish?: string;
  category: "CUSTOMER" | "BMI";
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DossierDocumentsChecklistResponse {
  checklistId: number;
  evaluationId: number;
  documentTypeId: number;
  hasPhysicalCopy?: boolean;
  hasElectronicCopy?: boolean;
  electronicFilePath?: string;
  notes?: string;
}

export type DossierDocumentsChecklistRequest = Omit<DossierDocumentsChecklistResponse, "checklistId">;

export interface EvaluationSignatureResponse {
  signatureId: number;
  evaluationId: number;
  signatureType: "EVALUATOR" | "SUPERVISOR";
  userId?: number;
  signatureDate?: string;
  fullName?: string;
  position?: string;
  digitalSignature?: string;
}

export type EvaluationSignatureRequest = Omit<EvaluationSignatureResponse, "signatureId">;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Evaluation main
export const createEvaluation = (payload: InspectionCompletionEvaluationRequest) =>
  api<InspectionCompletionEvaluationResponse>(`/api/evaluations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getEvaluationsByDossier = (dossierId: number) =>
  api<InspectionCompletionEvaluationResponse[]>(`/api/evaluations/by-dossier/${dossierId}`);

// Categories & Criteria
export const getAllCategories = () =>
  api<EvaluationCategoryResponse[]>(`/api/evaluations/categories/all`);

export const getCriteriaByCategory = (categoryId: number) =>
  api<EvaluationCriteriaResponse[]>(`/api/evaluations/criteria/by-category/${categoryId}`);

// Results
export const getResultsByEvaluation = (evaluationId: number) =>
  api<EvaluationResultResponse[]>(`/api/evaluations/results/by-evaluation/${evaluationId}`);

export const createResult = (payload: EvaluationResultRequest) =>
  api<EvaluationResultResponse>(`/api/evaluations/results`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateResult = (resultId: number, payload: EvaluationResultRequest) =>
  api<EvaluationResultResponse>(`/api/evaluations/results/${resultId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// Document Types & Checklist
export const getAllDocumentTypes = () =>
  api<DossierDocumentTypeResponse[]>(`/api/evaluations/document-types/all`);

export const getChecklistByEvaluation = (evaluationId: number) =>
  api<DossierDocumentsChecklistResponse[]>(`/api/evaluations/checklist/by-evaluation/${evaluationId}`);

export const createChecklistItem = (payload: DossierDocumentsChecklistRequest) =>
  api<DossierDocumentsChecklistResponse>(`/api/evaluations/checklist`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateChecklistItem = (
  checklistId: number,
  payload: DossierDocumentsChecklistRequest
) =>
  api<DossierDocumentsChecklistResponse>(`/api/evaluations/checklist/${checklistId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// Signatures
export const getSignaturesByEvaluation = (evaluationId: number) =>
  api<EvaluationSignatureResponse[]>(`/api/evaluations/signatures/by-evaluation/${evaluationId}`);

export const createSignature = (payload: EvaluationSignatureRequest) =>
  api<EvaluationSignatureResponse>(`/api/evaluations/signatures`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateSignature = (signatureId: number, payload: EvaluationSignatureRequest) =>
  api<EvaluationSignatureResponse>(`/api/evaluations/signatures/${signatureId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
