export interface ClassroomSummary {
    id: number;
    grade: number;
    classNo: string;
    teacherId: number;
    teacherName: string;
}

export interface TeacherInfo {
    id: number;
    name: string;
    gender: boolean;
    phone: string;
    birthday: Date;
    isLunar: boolean;
}

export interface StudentInfo {
    id: number;
    grade: number;
    classNo: string;
    classroomId: number;
    name: string;
    gender: boolean;
    school: string;
    phone: string;
    parentPhone: string;
    address: string;
    birthday: Date;
    status: number;
    registeredAt: Date;
    promotedAt: Date;
    remark: string;
}

export interface Sheet {
    studentAttendances: StudentAttendance[];
    teacherReport: TeacherReport;
    teacherAttendances: TeacherAttendance[];
}
export interface StudentAttendance {
    id: number;
    studentName: string;
    status: boolean;
    comments: string;
}
export interface TeacherReport {
    id: number;
    worship: number;
    otn: boolean;
    dawnPray: number;
    comments: string;
}

export interface TeacherAttendance {
    id: number;
    teacherName: string;
    status: boolean;
    comments: string;
}

export interface BirthdayResponse {
    month: number;
    studentBirthdays: StudentBirthday[]
    teacherBirthdays: TeacherBirthday[]
}
export interface StudentBirthday {
    id: number;
    name: string;
    grade: number;
    classNo: string;
    birthday: string;
}
export interface TeacherBirthday {
    id: number;
    name: string;
    isLunar: boolean;
    birthday: string;
}