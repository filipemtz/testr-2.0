
export class Course {
    public id: number = 0;
    public url: string = "";
    public name: string = "";
    public visible: boolean = false;
    public teachers: string[] = [];
    public students?: string[] = [];
    public isEditing?: boolean = false;
    public originalName: string = "";

    public static getDefaultCourse() : Course {
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