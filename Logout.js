import React, { useEffect } from "react";
import { useLinkTo } from '@react-navigation/native';


export default function Logout({ navigation }) {
    useEffect(() => {
        navigation.reset({ index: 0, routes: [{ name: "Login" }], })
    }, [])
    
    return (
        <></>
    )
};


