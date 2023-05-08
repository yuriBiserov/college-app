import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, data) => {
    try {
        await AsyncStorage.setItem(`@${key}`, data)
    } catch (e) {
        // saving error
    }
}
const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(`@${key}`)
        if (value !== null) {
            return value
        }
    } catch (e) {
        return false
    }
    return false
}
const clearAllData = async () => {
    AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then()
}
export default {
    storeData,
    getData,
    clearAllData
}