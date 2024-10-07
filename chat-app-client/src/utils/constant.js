
// this is the  main server url
export const HOST = import.meta.env.VITE_SERVER_URL;


// url for all endpoints related to auth
export const AUTH_URL = '/api/auth'
export const CONTACT_URL = '/api/contact'
export const MESSAGE_URL  = '/api/message'

//all auth routes
export const SIGNUP_ROUTE = `${AUTH_URL}/signup`
export const LOGIN_ROUTE = `${AUTH_URL}/login`
export const LOGOUT_ROUTE = `${AUTH_URL}/logout`






export const GET_USER_INFO = `${AUTH_URL}/getUserInfo`
export const UPDATE_PROFILE_ROUTE = `${AUTH_URL}/updateProfile`

export const PROFILE_PICTURE_UPLOAD_ROUTE = `${AUTH_URL}/uploadProfilePicture`
export const PROFILE_PICTURE_DELETE_ROUTE = `${AUTH_URL}/deleteProfileImage`





export const SEARCH_CONTACTS_ROUTE = `${CONTACT_URL}/searchContacts`






export const GET_MESSAGES = `${MESSAGE_URL}/getMessages`




