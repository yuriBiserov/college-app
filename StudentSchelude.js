import dayjs from "dayjs";
import { Center, Spinner, Stack } from "native-base";
import { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import apiService from "./services/api.service";
import CurrentDayLessons from "./CurrentDayLessons";
import MenuButton from "./MenuButton";

export default function StudentSchelude({ route, navigation }) {
    const student = route.params.student
    const [selected, setSelected] = useState('');
    const [lessons, setLessons] = useState([])
    const [markedDays, setMarkedDays] = useState({})
    const [lessonsLoaded, setLessonsLoaded] = useState(false)
    const [currentLessons, setCurrentLessons] = useState([])
    let dates = []

    useEffect(() => {
        setLessonsLoaded(false)
        setSelected(dayjs().format('YYYY-MM-DD'))
    }, [])

    useEffect(() => {
        if (!lessonsLoaded) {
            setCurrentLessons([])
            apiService.getStudentLessons(student.id).then(r => {
                setLessons(r.data.sort((a, b) => new Date(a.date) - new Date(b.date)))
                r.data.map(d => {
                    const date = dayjs(d.date).format('YYYY-MM-DD')
                    dates.push(date)
                    if (date == dayjs().format('YYYY-MM-DD')) {
                        setCurrentLessons(currentLessons => [...currentLessons, d])
                    }
                })

                dates.forEach(day => {
                    markedDays[day] = {
                        marked: true, dotColor: 'red',
                    };
                })
                setLessonsLoaded(true)
            })
        }
    }, [lessonsLoaded])

    //handle selected day lessons
    useEffect(() => {
        setCurrentLessons([])
        let lsns = []
        lessons.map((l => {
            const date = dayjs(l.date).format('YYYY-MM-DD')
            if (date == selected) {
                lsns.push(l)
                setCurrentLessons(currentLessons => [...currentLessons, l])
            }
        }))
    }, [selected])

    return (
        <>
            <MenuButton student={student} />
            {
                lessonsLoaded ?
                    <>
                        <Calendar
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#b6c1cd',
                                selectedDayBackgroundColor: '#3a88fd',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#3a88fd',
                                arrowColor: '#3a88fd',
                                dayTextColor: '#2d4150',
                                textDisabledColor: '#d9e'
                            }}
                            style={{ borderRadius: 2, elevation: 1, margin: 10, paddingBottom: 20 }}
                            onDayPress={day => { setSelected(day.dateString) }}
                            hideExtraDays
                            markedDates={{
                                ...markedDays,
                                [selected]: {
                                    selected: true,
                                    disableTouchEvent: true,
                                    ...markedDays.hasOwnProperty(selected) ? markedDays[selected] : {},
                                }
                            }}
                        />
                        {currentLessons && currentLessons.length > 0 &&
                            <CurrentDayLessons setLessonsLoaded={setLessonsLoaded} selected={selected} setSelected={setSelected} currentLessons={currentLessons} setCurrentLessons={setCurrentLessons} />
                        }
                    </> :
                    <Center flex={1} px="3">
                        <Stack space={4} w="100%" alignItems="center">
                            <Spinner size="lg" />
                        </Stack>
                    </Center>
            }
        </>
    );
}