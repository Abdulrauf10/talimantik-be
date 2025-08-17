export type RegisterDTO = {
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  age?: number;
  gender?: 'laki-laki' | 'perempuan';
};
