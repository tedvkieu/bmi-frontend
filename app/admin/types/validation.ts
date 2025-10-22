export interface DossierValidationException {
  error: string;
  message: string;
  errors: string[];
  timestamp: string;
  status: number;
}

