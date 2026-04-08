import React from 'react'
import { SGButton } from '@sgroup/ui'

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1>SGROUP ERP Super-App</h1>
      <p style={{ marginBottom: 20 }}>Super-App Host Shell is running!</p>
      
      <SGButton title="Legacy Component Testing" onPress={() => alert('Works!')} />
    </div>
  )
}

export default App
