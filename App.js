import React from 'react';
import Login from './Login';
import { NativeBaseProvider } from 'native-base';
import StudentSchelude from './StudentSchelude';
import { NavigationContainer } from '@react-navigation/native';
import MenuButton from './MenuButton';
import {
  DrawerContent,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import Logout from './Logout';
import LecturerSchelude from './LecturerSchelude';
import { useState } from 'react';
import SignedAsContext from './services/GlobalContext';
import { useEffect } from 'react';

export default function App() {
  const Drawer = createDrawerNavigator();

  const [signed, setSigned] = useState("Student");
  const value = { signed, setSigned };

  useEffect(() => {
    setSigned('')
  }, [])

  return (
    <SignedAsContext.Provider
      value={value}>
      <NavigationContainer>
        <NativeBaseProvider>
          <Drawer.Navigator initialRouteName="Login">
            <Drawer.Screen
              options=
              {{
                swipeEnabled: false,
                headerLeft: () => (<MenuButton onPress={() => navigation.toggleDrawer()} />),
                drawerItemStyle: { display: 'none' }
              }}
              name="Login" component={Login} />
            <Drawer.Screen
              name="StudentSchelude"
              options={{
                title: 'Student Schelude',
                drawerItemStyle: { display: signed == 'Lecturer' ? 'none' : 'flex' }
              }}
              component={StudentSchelude}
            />
            <Drawer.Screen
              name="LecturerSchelude"
              options={{
                title: 'Lecturer Schelude',
                drawerItemStyle: { display: signed == 'Student' ? 'none' : 'flex' }
              }}
              component={LecturerSchelude} />
            <Drawer.Screen name="Logout" component={Logout} />
          </Drawer.Navigator>
        </NativeBaseProvider>
      </NavigationContainer>
    </SignedAsContext.Provider>

  );
}


