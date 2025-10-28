// import { useState } from 'react'
// import './App.css'

// function App() {

//   return (
//     <>
//       <div>
//         <span className='text-red-400'>
//           Hello
//           l am here
//         </span>
//       </div>
//     </>
//   )
// }

// export default App



import { useEffect } from 'react';

import {RouterProvider} from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';

import './App.css'

import router from "./router";


function App() {

  const dispatch = useDispatch();

  return (
     <RouterProvider router={router} />
  )
}

export default App
