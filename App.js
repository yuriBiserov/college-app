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
import { Text } from 'react-native';

export default function App() {
  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <Drawer.Navigator initialRouteName="Login">
          <Drawer.Screen
            options=
            // {{
            //   swipeEnabled: false,
            //   headerLeft: () => (<MenuButton onPress={() => navigation.toggleDrawer()} />),
            //   drawerItemStyle: { height: 0 }
            // }}
            name="Login" component={Login} />
          <Drawer.Screen name="StudentSchelude" options={{title:'Schelude'}} component={StudentSchelude} />
          <Drawer.Screen name="Logout" component={Logout} />
        </Drawer.Navigator>
      </NativeBaseProvider>
    </NavigationContainer>
  );
}


