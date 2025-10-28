
import { useState } from 'react'

import Login from '../components/auth/Login'
import Register from '../components/auth/Register'

function Auth() {

  const [show_register, setShowRegister] = useState(false);

  return (
    <div>
      {
        !show_register ?
        <Login  show_register={show_register} setShowRegister={setShowRegister} />
        :
        <Register show_register={show_register} setShowRegister={setShowRegister} />
      }
    </div>
  )
}

export default Auth