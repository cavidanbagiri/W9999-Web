import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux'
import store from './store'


import { GoogleOAuthProvider } from '@react-oauth/google'


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      {/* <App /> */}
      <GoogleOAuthProvider clientId='682798972940-fsqlrcupbij86mrt9ebpcmtk52jrrqa8.apps.googleusercontent.com'>
        <App />
      </GoogleOAuthProvider>

    </StrictMode>
  </Provider>
)
