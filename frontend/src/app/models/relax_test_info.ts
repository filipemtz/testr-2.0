export class RelaxTestInfo {
    id: number | null;
    question: number;
    database: string;
    correct_query: string;

    constructor() {
        this.id = null;
        this.question = -1;
        this.database = "";
        this.correct_query = "";
    }
}