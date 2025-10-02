import { NavLinkComponent } from '~/components/navlink'
import { useTheme } from '~/context/themeContext'
import { HiOutlineSun } from 'react-icons/hi'
import { HiSun } from 'react-icons/hi'
import { useNavigate } from 'react-router'


export const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()  

  let clicks = 4
  const onMultipleClick = () => {
    clicks = clicks - 1

    
    if (clicks === 0) {
      navigate('/login')
      clicks = 4
    }
  }

  return (
    <div
      className={`flex transition-all backdrop-blur-md justify-center items-center w-fit mx-auto rounded-xl px-1.5 mt-2 h-14 shadow-lg ${
        theme === 'dark' ? 'bg-black/70' : 'bg-white/50'
      } `}
    >
      <button className="mt-2" onClick={onMultipleClick}>
        <img src="/logo sin letras.svg" alt="Logo" width="70" height="19" />
      </button>

      <nav className="flex gap-x-3 mr-2">
        <NavLinkComponent to="/">Home</NavLinkComponent>

        <NavLinkComponent to="/categories">Categorias</NavLinkComponent>

        <NavLinkComponent to="/products">Productos</NavLinkComponent>

        <div className="flex justify-center items-center relative">
          <button
            onClick={toggleTheme}
            className="w-6 items-center justify-center hover:scale-110 "
            type="button"
          >
            <HiOutlineSun
              className={`absolute inset-0 m-auto size-6 transition-opacity duration-400
          ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
        `}
            />
            <HiSun
              className={`absolute inset-0 m-auto size-6 transition-opacity duration-400
          ${theme !== 'dark' ? 'opacity-100 text-black' : 'opacity-0'}
        `}
              
            />
          </button>
        </div>
      </nav>
    </div>
  )
}
