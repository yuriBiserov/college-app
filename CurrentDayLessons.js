import { Text, View } from 'react-native';
import * as Location from 'expo-location'
import React, { useEffect, useState } from 'react';
import { Button, Icon, Row, ScrollView } from 'native-base';
import { Path } from 'react-native-svg';
import dayjs from 'dayjs';
import apiService from './services/api.service';
import storageService from './services/storage.service';
import Distance from './services/CheckDistance';

export default function CurrentDayLessons(props) {
    const selectedDay = props.selected || dayjs()
    let [studentId, setStudentId] = useState('')
    const [sending, setSending] = useState(false)
    let location = {lat:0 ,lon:0 }
    const lectLocation = { lat: 32.705264, lon: 35.591066 }

    function useForceUpdate(){
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

    const attendance = (lesson) => {
        if (isLessonInPast(lesson) && !(lesson.attendance.some(a => a == studentId))) {
            return 'NotSent'
        }
        if (lesson.attendance.some(a => a == studentId)) {
            return 'Sent'
        }
        if (isOngoingLesson(lesson) && !(lesson.attendance.some(a => a == studentId))) {
            return 'OngoingLesson'
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

        //check if lesson in class
        if (l.in_class) {
            await getLocation().then((r) => {
                const inRadius = Distance.getDistanceFromLatLonInMeters( location.lat , location.lon  , lectLocation.lat , lectLocation.lon  ) < 50
                if (!inRadius) {
                    alert("You not in class")
                } else {
                    sendAttendance(l)
                    setSending(false)
                }
                setSending(false)
            },err=> setSending(false))
        } else {
            //lesson in zoom , just send attendance 
            sendAttendance(l)
            setSending(false)
        }
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
                                attendance(l) == 'OngoingLesson' &&
                                <Row style={{ alignItems: 'center' }}>
                                    <Button
                                        isLoading={sending}
                                        isLoadingText="Sending..."
                                        onPress={e => handleSend(l)}
                                        style={{ height: 45, backgroundColor: '#3a88fd' }}>
                                        Send Attendance
                                    </Button>
                                </Row>
                            }
                            {
                                attendance(l) == 'Sent' &&
                                <Row style={{ alignItems: 'center' }}>
                                    <Button
                                        style={{ height: 45, backgroundColor: '#54df2a' }}>
                                        Attendance Sent!
                                    </Button>
                                </Row>
                            }
                            {
                                attendance(l) == 'NotSent' &&
                                <Row style={{ alignItems: 'center' }}>
                                    <Button
                                        style={{ height: 45, backgroundColor: '#ff7070' }}>
                                        Attendance not Recorded!
                                    </Button>
                                </Row>
                            }
                        </Row>
                    </View>
                })}
            </ScrollView>
        </>
    );
}


