import { Platform } from 'react-native';
import axios from 'axios';


const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';


export const instance = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
});