import React from 'react'

function Header() {
  return (
    <div>
       <header>
       <img id="logoPD" src="images/logo-pd.png" alt="Logo" />
       <p  className='ms-auto  pt-3' style={{color:'white',cursor:'pointe'}}>Sign up</p>
       <img style={{width:'20px',height:'20px', borderRadius:'50%'}} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9dB5ERe0v9QUXux7rr6TnHW9nNlvmZpWqqA&s" alt="img" />
       </header>
      
    </div>
  )
}

export default Header
