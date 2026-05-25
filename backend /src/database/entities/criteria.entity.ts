export class CriteriaEntity {
  id: string;
  name: string;
  maxPoints: number;
  parentId?: string | null; // Mối quan hệ đệ quy Cha - Con
  children?: CriteriaEntity[];
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
