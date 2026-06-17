
export class Course {
    public id: number = 0;
    public url: string = "";
    public name: string = "";
    public visible: boolean = false;
    public teachers: string[] = [];
    public students?: string[] = [];
    public isEditing?: boolean = false;
    public originalName: string = "";

    public static getDefaultCourse(): Course {
        let course: Course = new Course();

        course.id = -1;
        course.url = "";
        course.name = "Novo Curso";
        course.visible = true;
        course.teachers = [];
        course.students = [];
        course.originalName = "Novo Curso";

        return course;
    }
}


export class CourseStats {
    public rank: number = 0;
    public n_solved: number = 0;
    public n_visible_questions: number = 0;
    public total_students: number = 0;

    public static getDefault(): CourseStats {
        return new CourseStats();
    }
}


