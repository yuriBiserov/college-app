import axios from "axios"
import { API_URL } from "./api.url"


const loginStudent = (student) => {  
    return axios.post(`${API_URL}/student/login`, student)
}
const loginLecturer = (lecturer) => {
    return axios.post(`${API_URL}/lecturer/login`, lecturer)
}
const getLessons = (id) => {
    return axios.get(`${API_URL}/lessons/get-lessons/${id}`)
}
const sendAttendance = (lesson,student) => {
    return axios.post(`${API_URL}/lessons/attendance`, lesson,student)
}
const getAttendance = (studentId,lessonId) => {
    return axios.get(`${API_URL}/lessons/attendance/${studentId}&${lessonId}`)
}
const getStudent = (id) => {
    return axios.get(`${API_URL}/student/get-student/${id}`)
}


export default {
    loginStudent,
    loginLecturer,
    getLessons,
    sendAttendance,
    getAttendance,
    getStudent
}