export interface Lawyer {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  lawyerProfile: {
    practiceAreas?: string | null;
    experienceYears: number;
    rating: number;
    verified: boolean;
    consultationFee?: number | null;
    districts?: string | null;
  } | null;
}