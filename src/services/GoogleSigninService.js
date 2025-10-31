// import { loginStart, loginSuccess, loginFailure } from '../slices/authSlice'

import { loginStart, loginSuccess, loginFailure, logout } from '../store/auth_slice'

// Thunk for Google authentication
export const googleLogin = (code) => async (dispatch) => {
  dispatch(loginStart())
  
  try {
    // const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google`, {
    const response = await fetch('http://localhost:8000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Authentication failed')
    }

    const data = await response.json()
    dispatch(loginSuccess(data))
    
  } catch (error) {
    dispatch(loginFailure(error.message))
  }
}

// Thunk for token verification on app start
export const verifyToken = () => async (dispatch, getState) => {
  const { token } = getState().auth
  
  if (!token) return

  try {
    // const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify`, {
    const response = await fetch('http://localhost:8000/api/auth/google', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const userData = await response.json()
      dispatch(loginSuccess({ user: userData, access_token: token }))
    } else {
      dispatch(logout())
    }
  } catch (error) {
    dispatch(logout())
  }
}