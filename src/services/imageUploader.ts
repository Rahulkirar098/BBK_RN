import { apiCallMethod } from "../api/apiCallMethod";

export const uploadImage = async (file: any, path: string) => {
    try {
        let response = await apiCallMethod.uploadImage({
            image: file,
            path
        })
        return response.data;
    } catch (error) {
        console.log('Upload error:', error);
        return '';
    }
};