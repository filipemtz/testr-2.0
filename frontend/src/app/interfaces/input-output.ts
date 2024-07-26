export interface InputOutput {
    id: number;
    url: string;
    input: string;
    output: string;
    visible: boolean;
    question: number;
    isEditing?: boolean;
    initialInput?: string;
    initialOutput?: string;
    initialVisible?: boolean;
}
