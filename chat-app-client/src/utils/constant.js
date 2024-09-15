
// this is the  main server url
export const HOST = import.meta.env.VITE_SERVER_URL;


// url for all endpoints related to auth
export const AUTH_URL = '/api/auth'

//all auth routes
export const SIGNUP_ROUTE = `${AUTH_URL}/signup`
export const LOGIN_ROUTE = `${AUTH_URL}/login`


export const GET_USER_INFO = `${AUTH_URL}/getUserInfo`
export const UPDATE_PROFILE_ROUTE  = `${AUTH_URL}/updateProfile`