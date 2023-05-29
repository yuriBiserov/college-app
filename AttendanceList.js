import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import apiService from "./services/api.service";
import storageService from "./services/storage.service";
import { Button, Center, Icon, Row, ScrollView, Spinner, Stack, View } from "native-base";
import dayjs from "dayjs";
import { Path } from "react-native-svg";
import { useIsFocused } from "@react-navigation/native";
import { Modal } from "native-base";


export default function AttendanceList({ navigation }) {
    const [lecturer, setLecturer] = useState({})
    const [lessons, setLessons] = useState([])
    const isFocused = useIsFocused();
    const [loaded, setLoaded] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [currentLessonsModal, setCurrentLessonModal] = useState({})
    const [attendancyList, setAttendancyList] = useState([])

    useEffect(() => {
        setLessons([])
        setLoaded(false)
        
        if (isFocused) {
            storageService.getData("lecturer")
                .then((response) => {
                    setLecturer(JSON.parse(response))
                })
        }
    }, [isFocused])


    useEffect(() => {
        apiService.getLecturerLessons(lecturer.id).then(r => {
            setLessons(r.data.sort((a, b) => new Date(a.date) - new Date(b.date)))
            setLoaded(true)
        })
    }, [lecturer])

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

    return (
        <>
            {
                lessons && lessons.length ?
                    <ScrollView style={{ flex: 1, margin: 10, backgroundColor: '#ffffff', borderRadius: 2, elevation: 1, padding: 16, }}>
                        <Row style={{ marginBottom: 18, paddingTop: 16 }}>
                            <Row style={{ width: '25%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Date</Text>
                            </Row>
                            <Row style={{ width: '25%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Course</Text>
                            </Row>
                            <Row style={{ width: '15%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Time</Text>
                            </Row>
                            <Row style={{ width: '35%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}></Text>
                            </Row>
                        </Row>
                        {lessons.map((lesson) => {
                            return (
                                <Row key={lesson._id} style={{ marginBottom: 18 }}>
                                    <Row style={{ width: '25%' }}>
                                        <Text onPress={() => checkAttendancy(lesson)}>{dayjs(lesson.date).format('dddd DD/MM/YY')}</Text>
                                    </Row>

                                    <Row style={{ width: '25%' }}>
                                        <Text>{lesson.course.name}</Text>
                                    </Row>

                                    <Row style={{ width: '15%' }}>
                                        <Text>{dayjs(lesson.date).format('HH:mm')}</Text>
                                    </Row>

                                    <Row style={{ width: '35%' }}>
                                        <Button _text={{
                                            color: "#333",
                                        }}
                                            onPress={() => checkAttendancy(lesson)}
                                            startIcon={
                                                <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><Path fill='#333' d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></Icon>
                                            }
                                            style={{ height: 45, backgroundColor: '#facc15' }}>
                                            Show List
                                        </Button>
                                    </Row>
                                </Row>
                            )
                        })}
                    </ScrollView> : <></>
            }
            {
                !loaded ?
                    <Center flex={1} px="3">
                        <Stack space={4} w="100%" alignItems="center">
                            <Spinner size="lg" />
                        </Stack>
                    </Center> : <></>
            }
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
    )
};


