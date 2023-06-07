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
import AttendanceList from './AttendanceList';
import { I18nManager } from 'react-native';

export default function App() {
  I18nManager.forceRTL(false)
  I18nManager.allowRTL(false)
  I18nManager.swapLeftAndRightInRTL(false);

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
                title: 'Schelude',
                drawerItemStyle: { display: signed == 'Lecturer' ? 'none' : 'flex' }
              }}
              component={StudentSchelude}
            />
            <Drawer.Screen
              name="LecturerSchelude"
              options={{
                title: 'Schelude',
                drawerItemStyle: { display: signed == 'Student' ? 'none' : 'flex' }
              }}
              component={LecturerSchelude}
            />
             <Drawer.Screen
              name="AttendanceList"
              options={{
                title: 'Attendance',
                drawerItemStyle: { display: signed == 'Student' ? 'none' : 'flex' }
              }}
              component={AttendanceList}
            />
            <Drawer.Screen name="Logout" component={Logout} />
          </Drawer.Navigator>
        </NativeBaseProvider>
      </NavigationContainer>
    </SignedAsContext.Provider>

  );
}


