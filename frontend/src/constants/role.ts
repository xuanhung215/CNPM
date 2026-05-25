export const Role = {
  ADMIN: 'admin',
  CVHT: 'cvht',
  BCS: 'bcs',
  SINHVIEN: 'sinhvien',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
