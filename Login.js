import React, { useEffect, useState } from "react";
import { Center } from "native-base";
import { Stack } from "native-base";
import { Button } from "native-base";
import { Input } from "native-base";
import { Icon } from "native-base";
import { Pressable } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import apiService from './services/api.service';
import storageService from "./services/storage.service";
import { LogBox, Text } from 'react-native';
LogBox.ignoreLogs([
    'Require cycle:'
])

export default function Login(props) {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginFailed, setLoginFailed] = useState('')
    const [isTrue, setIsTrue] = useState(true)
    const [statusSelected, setStatusSelected] = useState('Student')

    function textChange() {
        setIsTrue(!isTrue)
        return isTrue ? setStatusSelected('Lecturer') : setStatusSelected("Student")
    }

    const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
        defaultValues: {
            id: '',
            password: ''
        }
    });

    useEffect(() => {
        storageService.getData('id').then(i => {
            storageService.getData('password').then(p => {
                if (i && p) {
                    setValue('id', i)
                    setValue('password', p)
                }
            })
        })
    }, [])

    const onSubmit = (data) => {
        if (statusSelected == 'Student') {
            setLoginFailed('')
            storageService.clearAllData().then()
            setLoading(true)
            apiService.loginStudent(data).then(r => {
                const student = r.data.student
                storageService.storeData('token', r.data.token).then(r => {
                    storageService.getData('token').then(token => {
                        if (token) {
                            storageService.storeData('id', getValues('id')).then()
                            storageService.storeData('password', getValues('password')).then()
                            props.navigation.navigate('StudentSchelude', { student })
                        }
                        setLoading(false)
                    })
                }, err => {
                    setLoading(false)
                })
            }, err => {
                setLoading(false)
                setLoginFailed('Wrong ID Or Password')
            })
        } else if (statusSelected == 'Lecturer') {
            alert('lecturer schelude component')
            // setLoginFailed('')
            // storageService.clearAllData().then()
            // setLoading(true)
            // apiService.loginLecturer(data).then(r => {
            //     const lecturer = r.data.lecturer
            //     storageService.storeData('token', r.data.token).then(r => {
            //         storageService.getData('token').then(token => {
            //             if (token) {
            //                 storageService.storeData('id', getValues('id')).then()
            //                 storageService.storeData('password', getValues('password')).then()
            //                 props.navigation.navigate('Schelude', { lecturer })
            //             }
            //             setLoading(false)
            //         })
            //     }, err => {
            //         setLoading(false)
            //     })
            // }, err => {
            //     setLoading(false)
            //     setLoginFailed('Wrong ID Or Password')
            // })


        }

    };

    return (
        <Center flex={1} px="3">
            <Stack space={4} w="100%" alignItems="center">
                <Button
                    onPress={textChange}
                    w={{ base: "75%", md: "25%" }}
                    backgroundColor='#a6a6a6'>
                    {statusSelected}
                </Button>
                {errors.id && <Text style={{ color: 'red' }}>ID is required</Text>}
                <Controller
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            defaultValue={getValues('id')}
                            focusOutlineColor='#3a88fd'
                            backgroundColor='transparent'
                            onBlur={onBlur}
                            onChangeText={onChange}
                            w={{ base: "75%" }}
                            InputLeftElement={<Icon as={<MaterialIcons name="person" />} size={5} ml="2" color="muted.400" />}
                            placeholder="ID" />
                    )}
                    name="id"
                />
                {errors.password && <Text style={{ color: 'red' }}>Password is required</Text>}
                <Controller
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            defaultValue={getValues('password')}
                            backgroundColor='transparent'
                            focusOutlineColor='#3a88fd'
                            onBlur={onBlur}
                            onChangeText={onChange}
                            name="password"
                            w={{ base: "75%", md: "25%" }}
                            type={show ? "text" : "password"}
                            InputRightElement={
                                <Pressable
                                    onPress={() => setShow(!show)}>
                                    <Icon as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
                                </Pressable>} placeholder="Password"
                        />
                    )}
                    name="password"
                />
                <Button
                    isLoading={loading}
                    isLoadingText="Login"
                    onPress={handleSubmit(onSubmit)}
                    w={{ base: "75%", md: "25%" }}
                    backgroundColor='#3a88fd'
                >
                    Login
                </Button>
            </Stack >
            {loginFailed &&
                <Text style={{ color: 'red', marginTop: 12 }}>{loginFailed}</Text>
            }
        </Center>
    )
};


