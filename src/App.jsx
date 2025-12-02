import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './page/Homepage.jsx'
import Promptpage from './page/Promptpage.jsx'
import TextPage from './page/textpage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/prompt" element={<TextPage />} />
        
      </Routes>

    </BrowserRouter>
  )
}

export default App

