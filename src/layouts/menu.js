const dashboard = {
    to: '/dashboard',
    icon: 'desktop-mac',
    label: 'Dashboard'
}

const students = {
    to: '/students',
    label: 'Students',
    icon: 'account-group'
}

const teachers = {
    to: '/teachers',
    label: 'Teachers',
    icon: 'teach'
}

const subjects = {
    to: '/subjects',
    label: 'Subjects',
    icon: 'text-subject'
}

const classroom = {
    to: '/classroom',
    label: 'Classroom',
    icon: 'school',
    //updateMark: true
}

const settings = {
    to: '/settings',
    label: 'Settings',
    icon: 'cog'
}

const reports = {
    to: '/reports',
    label: 'Reports',
    icon: 'file-chart'
}

export default {
    admin: [dashboard, students, teachers, subjects, classroom, reports, settings],
    student: [dashboard, classroom],
    teacher: [dashboard, students, classroom, reports]
}