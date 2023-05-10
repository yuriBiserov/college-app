import React, { useEffect } from "react";

export default function Logout({ navigation }) {
    useEffect(() => {
        navigation.reset({ index: 0, routes: [{ name: "Login" }], })
    }, [])
    
    return (
        <></>
    )
};


