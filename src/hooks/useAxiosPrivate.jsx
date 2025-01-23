import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../providers/AuthProvider";
import useAxiosPublic from "./useAxiosPublic";


const axiosPrivate = axios.create({
    baseURL: 'https://petadoption-server-roan.vercel.app/'
})

const useAxiosPrivate =()=>{
    const navigate = useNavigate();
    const { logOut } = useContext(AuthContext);

    // request interceptor to add authorization header for every secure call to teh api
    axiosPrivate.interceptors.request.use(function (config) {
        const token = localStorage.getItem('access-token')
        // console.log('request stopped by interceptors', token)
        config.headers.authorization = `Bearer ${token}`;
        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    });


    // intercepts 401 and 403 status
    axiosPrivate.interceptors.response.use(function (response) {
        return response;
    }, async (error) => {
        const status = error.response.status;
        // console.log('status error in the interceptor', status);
        // for 401 or 403 logout the user and move the user to the login
        if (status === 401 || status === 403) {
            await logOut();
            navigate('/login');
        }
        return Promise.reject(error);
    })


    return axiosPrivate;
}
export default useAxiosPrivate