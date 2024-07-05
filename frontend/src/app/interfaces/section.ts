import { Question } from './question';

export interface Section {
    id: number;
    url: string;
    name: string;
    course: number;
    isEditing?: boolean;
    questions? : Question[];
    originalName: string;
}