// import { Button, StyleSheet, View } from 'react-native';
// import * as Location from 'expo-location'
// import { useEffect, useState } from 'react';
// import React from 'react';

// export default function SendLocationComponent() {
//   const [location, setLocation] = useState({
//     latitude: 0,
//     longitude: 0,
//   })

//   const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
//     const earthRadius = 6371e3; // Radius of the earth in meters
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//       Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = earthRadius * c; // Distance in meters
//     return distance.toFixed(0);
//   }

//   const deg2rad = (deg) => {
//     return deg * (Math.PI / 180)
//   }

//   const getLocation = async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status === 'granted') {
//       await Location.getCurrentPositionAsync({}).then(r => {
//         setLocation({
//           latitude: r.coords.latitude,
//           longitude: r.coords.longitude
//         });
//       });
//     }
//   }

//   useEffect(() => {
//     if (location.latitude !== 0 && location.longitude !== 0) {
//       console.log(location)
//     }
//   }, [location])


//   return (
//     <View style={styles.container}>
//       <View style={styles.main}>
//         <View style={styles.myButton}>
//           <Button style={styles.btn} title="Send location" onPress={() => getLocation()}>

//           </Button>
//         </View>
//       </View>
//       <View style={styles.footer}>

//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#333",
//     height: "100%",
//   },
//   header: {
//     backgroundColor: 'white',
//     height: 100,
//     width: '100%',
//     margin: 'auto',
//     top: 40,
//   },
//   main: {
//     backgroundColor: '#c4c4c4',
//     height: '95%',
//     top: '5%'

//   },
// });


