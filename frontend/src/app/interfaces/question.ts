export interface Question {
	id?: number;
	url?: string;
	name: string;
	description: string;
	language: string;
	submission_deadline: string;
	memory_limit: number;
	time_limit_seconds: number;
	cpu_limit: number;
	section: number;
}