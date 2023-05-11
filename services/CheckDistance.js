const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371e3; // Radius of the earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c; // Distance in meters
    console.log('Distance Between Student and Lecturer '+distance.toFixed(0))
    return distance.toFixed(0);
}
const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}
export default {
    getDistanceFromLatLonInMeters
}