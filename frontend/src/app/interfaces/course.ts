export interface Course {
    id: number;
    url: string;
    name: string;
    visible: boolean;
    teachers: string[];
    students?: string[];
    isEditing?: boolean;
    originalName: string;
}