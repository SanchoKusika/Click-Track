export type MySettings = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MENTOR' | 'INTERN';
  createdAt: string;
  phone: string | null;
  photoUrl: string | null;
};

export type UpdateMySettingsPayload = {
  phone?: string | null;
  removePhoto?: boolean;
  photo?: File | null;
};
