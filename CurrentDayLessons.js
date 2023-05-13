import { Text, View } from 'react-native';
import * as Location from 'expo-location'
import React, { useContext, useEffect, useState } from 'react';
import { Button, Icon, Row, ScrollView } from 'native-base';
import { Path } from 'react-native-svg';
import dayjs from 'dayjs';
import apiService from './services/api.service';
import storageService from './services/storage.service';
import Distance from './services/CheckDistance';
import SignedAsContext from './services/GlobalContext';
import { Modal } from "native-base";
import { PixelRatio } from 'react-native';

export default function CurrentDayLessons(props) {
    const selectedDay = props.selected || dayjs()
    const { signed, setSigned } = useContext(SignedAsContext);
    let [studentId, setStudentId] = useState('')
    const [sending, setSending] = useState(false)
    const [showModal, setShowModal] = useState(false);
    let location = { lat: 0, lon: 0 }
    const [attendancyList, setAttendancyList] = useState([])
    const [currentLessonsModal, setCurrentLessonModal] = useState({})

    function useForceUpdate() {
        const [value, setValue] = useState(0);
        return () => setValue(value => value + 1);
    }

    const forceUpdate = useForceUpdate();

    const isOngoingLesson = (lesson) => {
        if (lesson && lesson.date && lesson.end_time) {
            const endHour = lesson.end_time[0] == '0' ? lesson.end_time[1] : lesson.end_time.substring(0, 2)
            const endMinutes = lesson.end_time.substring(3)
            const lessonEndTime = new Date(lesson.date).setUTCHours(endHour, endMinutes)
            const lessonStartTime = lesson.date
            const currentDate = dayjs().hour(new Date().getHours() + 3)
            return dayjs(currentDate).isBefore(dayjs(lessonEndTime)) && dayjs(currentDate).isAfter(dayjs(lessonStartTime))
        }
    }

    const isLessonInPast = (lesson) => {
        if (lesson && lesson.date && lesson.end_time) {
            const endHour = lesson.end_time[0] == '0' ? lesson.end_time[1] : lesson.end_time.substring(0, 2)
            const endMinutes = lesson.end_time.substring(3)
            const lessonEndTime = new Date(lesson.date).setUTCHours(endHour, endMinutes)
            const currentDate = dayjs().hour(new Date().getHours() + 3)
            return dayjs(currentDate).isAfter(dayjs(lessonEndTime))
        }
    }

    const attendanceButton = (lesson) => {
        if (signed == 'Student') {

            if (isLessonInPast(lesson) && !(lesson.attendance.some(a => a == studentId))) {
                return 'AttendanceNotRecorded'
            }
            if (lesson.attendance.some(a => a == studentId)) {
                return 'AttendanceSent'
            }
            if (isOngoingLesson(lesson) && !(lesson.attendance.some(a => a == studentId)) && lesson.latitude && lesson.longitude) {
                return 'SendAttendance'
            }
            if (isOngoingLesson(lesson) && !lesson.latitude && !lesson.longitude) {
                return 'WaitForLocation'
            }
        }
        if (signed == 'Lecturer') {
            if (isOngoingLesson(lesson) && !lesson.latitude && !lesson.longitude) {
                return 'AllowSending'
            }
            if (isOngoingLesson(lesson) && lesson.latitude && lesson.longitude) {
                return 'SendingAllowed'
            }
            if (isLessonInPast(lesson) && !lesson.latitude && !lesson.longitude) {
                return 'DidntAllowToSend'
            }
            if (isLessonInPast(lesson) && lesson.latitude && lesson.longitude) {
                return 'CheckAttendancy'
            }
        }

    }

    async function getLocation() {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
            await Location.getCurrentPositionAsync({}).then((r) => {
                location.lat = r.coords.latitude
                location.lon = r.coords.longitude
            })
        }

    }

    const sendAttendance = (l) => {
        const attendance = {
            id: studentId,
            lesson: l
        }
        apiService.sendAttendance(attendance).then(r => {
            let lessons = props.currentLessons
            lessons.map((a) => {
                if (a._id == l._id) {
                    a.attendance.push(studentId)
                }
            })
            props.setCurrentLessons(lessons)
            props.setSelected(dayjs().format('YYYY-MM-DD'))
            forceUpdate()
        })
    }

    const handleSend = async (l) => {
        setSending(true)

        if (signed == 'Student') {
            //check if lesson in class
            if (l.in_class) {
                await getLocation().then(() => {
                    const inRadius = Distance.getDistanceFromLatLonInMeters(location.lat, location.lon, l.latitude, l.longitude) < 50
                    if (!inRadius) {
                        alert("You not in class")
                    } else {
                        sendAttendance(l)
                        setSending(false)
                    }
                    console.log(l.latitude + " " + l.longitude + " Lecturer Location")
                    console.log(location.lat + " " + location.lon + " Student Location")

                    setSending(false)
                }, err => setSending(false))
            } else {
                //lesson in zoom , just send attendance 
                sendAttendance(l)
                setSending(false)
            }
        }
        if (signed == 'Lecturer') {
            if (l.in_class) {
                await getLocation().then(() => {
                    l.latitude = location.lat
                    l.longitude = location.lon
                    apiService.setLesson(l).then(() => { })
                    setSending(false)
                }, err => setSending(false))

            }
        }

    }

    const checkAttendancy = (lesson) => {
        setAttendancyList([])
        setCurrentLessonModal(lesson)
        
        let students = lesson.students
        students.map((student) => {
            if (lesson.attendance.some((aten) => aten == student.id)) {
                student.present = true
            } else {
                student.present = false
            }
        })
        setShowModal(true)
        setAttendancyList(students)
    }

    useEffect(() => {
        storageService.getData('id').then(r => {
            setStudentId(r)
        })
    }, [])

    return (
        <>
            <ScrollView style={{ flex: 1, margin: 10, backgroundColor: '#ffffff', borderRadius: 2, elevation: 1, padding: 16, }}>
                <Text style={{ fontSize: 18, marginBottom: 6 }}>{dayjs(selectedDay).format('dddd, MMMM D')}</Text>
                {props.currentLessons.map((l) => {
                    return <View key={l._id}>
                        <Row style={{ marginBottom: 20, borderBottomColor: '#ebebeb', borderBottomWidth: 1, paddingBottom: 10, justifyContent: 'space-between' }}>
                            <View>
                                <Row style={{ alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold', }}>{l.major}</Text>
                                </Row>

                                <Row style={{ alignItems: 'center' }}>
                                    <Icon style={{ marginEnd: 10 }} xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 384 512"><Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></Icon>
                                    <Text>{l.in_class ? l.class : 'Zoom'}</Text>
                                </Row>

                                <Row style={{ alignItems: 'center' }}>
                                    <Icon style={{ marginEnd: 10 }} xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><Path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" /></Icon>
                                    <Text style={{ fontWeight: 'bold', }}>{l.start_time} - {l.end_time}</Text>
                                </Row>

                                <Row style={{ alignItems: 'center' }}>
                                    <Icon style={{ marginEnd: 10 }} xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 640 512"><Path d="M160 64c0-35.3 28.7-64 64-64H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H336.8c-11.8-25.5-29.9-47.5-52.4-64H384V320c0-17.7 14.3-32 32-32h64c17.7 0 32 14.3 32 32v32h64V64L224 64v49.1C205.2 102.2 183.3 96 160 96V64zm0 64a96 96 0 1 1 0 192 96 96 0 1 1 0-192zM133.3 352h53.3C260.3 352 320 411.7 320 485.3c0 14.7-11.9 26.7-26.7 26.7H26.7C11.9 512 0 500.1 0 485.3C0 411.7 59.7 352 133.3 352z" /></Icon>
                                    <Text>{l.lecturer.first_name} {l.lecturer.last_name}</Text>
                                </Row>
                            </View>
                            {
                                attendanceButton(l) == 'SendAttendance' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        startIcon={
                                            <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></Icon>
                                        }
                                        isLoading={sending}
                                        isLoadingText="Sending..."
                                        onPress={() => handleSend(l)}
                                        style={{ backgroundColor: '#3a88fd' }}>
                                        Send Attendance
                                    </Button>
                                </Row>
                            }
                            {
                                attendanceButton(l) == 'AttendanceSent' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        startIcon={
                                            <Icon xmlSpace="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill="#cef490" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></Path></Icon>
                                        }
                                        style={{ backgroundColor: '#4fbe2d' }}>
                                        Attendance Sent!
                                    </Button>
                                </Row>
                            }
                            {/* {
                                attendanceButton(l) == 'WaitForLocation' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        style={{  backgroundColor: '#6c757d' }}>
                                        Wait for Location...
                                    </Button>
                                </Row>
                            } */}
                            {
                                attendanceButton(l) == 'AttendanceNotRecorded' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        startIcon={
                                            <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill="#fff" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></Icon>
                                        }
                                        style={{ maxWidth: '95%', backgroundColor: '#ff7070' }}>
                                        Attendance not Recorded
                                    </Button>
                                </Row>
                            }
                            {
                                attendanceButton(l) == 'AllowSending' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        isLoading={sending}
                                        isLoadingText="Sending Location..."
                                        onPress={() => handleSend(l)}
                                        style={{ maxWidth: '95%', backgroundColor: '#3a88fd' }}
                                        startIcon={
                                            <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></Icon>
                                        }
                                    >
                                        Set Lesson Location
                                    </Button>
                                </Row>
                            }
                            {
                                attendanceButton(l) == 'SendingAllowed' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        startIcon={
                                            <Icon xmlSpace="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill="#cef490" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></Path></Icon>
                                        }
                                        style={{ height: 45, backgroundColor: '#4fbe2d' }}>
                                        Location Sent
                                    </Button>
                                </Row>
                            }
                            {
                                attendanceButton(l) == 'DidntAllowToSend' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button
                                        startIcon={
                                            <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill="#fff" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></Icon>
                                        }
                                        style={{ height: 45, backgroundColor: '#ff7070' }}>
                                        Didn't sent Location!
                                    </Button>
                                </Row>
                            }
                            {
                                attendanceButton(l) == 'CheckAttendancy' &&
                                <Row style={{ justifyContent: 'flex-end', alignItems: 'center', flexShrink: 1 }}>
                                    <Button _text={{
                                        color: "#333",
                                    }}
                                        isLoadingText="Sending..."
                                        onPress={() => checkAttendancy(l)}
                                        startIcon={
                                            <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill='#333' d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></Icon>
                                        }
                                        style={{ height: 45, backgroundColor: '#facc15' }}>
                                        Check Attendance
                                    </Button>
                                </Row>
                            }
                        </Row>
                    </View>
                })}
            </ScrollView>


            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <Modal.Content width="100%">
                    <Modal.CloseButton />
                    <Modal.Header>
                        <Row>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{currentLessonsModal?.major} - {currentLessonsModal?.course?.name}</Text>
                        </Row>
                        <Row>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{dayjs(currentLessonsModal?.date).format('dddd, MMMM D')}</Text>
                        </Row>
                    </Modal.Header>
                    <ScrollView style={{ padding: 20 }}>
                        <Row style={{ marginBottom: 18 }}>
                            <Row style={{ width: '30%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>ID</Text>
                            </Row>
                            <Row style={{ width: '50%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Name</Text>
                            </Row>
                            <Row style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Present</Text>
                            </Row>
                        </Row>
                        {
                            attendancyList &&
                            attendancyList.map((student, idx) => {
                                return <Row key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottomColor: '#ebebeb', borderBottomWidth: 1, }}>
                                    <Row style={{ width: '30%' }}>
                                        <Text>{student.id}</Text>
                                    </Row>
                                    <Row style={{ width: '50%' }}>
                                        <Text>{student.first_name} {student.last_name}</Text>
                                    </Row>
                                    <Row style={{ width: '20%', justifyContent: 'center' }}>
                                        <Text>{student.present ?
                                            <Icon xmlSpace="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 512 512"><Path fill="#99e384" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></Path></Icon>
                                            :
                                            <Icon xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 512 512"><Path fill="#ff7070" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></Icon>}</Text>
                                    </Row>
                                </Row>
                            })
                        }
                    </ScrollView>
                </Modal.Content>
            </Modal>
        </>
    );
}


