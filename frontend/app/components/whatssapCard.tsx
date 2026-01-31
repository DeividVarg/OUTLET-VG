

export const action =() =>{
  alert ("Hola desde WhatsApp")
}

export const WhatssapCard = () => (

  <div className='hover:scale-110 transition-transform duration-300' 
  onClick={action}>
    <img src='/whatsapp-svgrepo-com.svg' alt="WhatsApp Card" />
  </div>

)