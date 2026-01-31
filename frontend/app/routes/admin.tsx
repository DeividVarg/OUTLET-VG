import { AdminCategories } from '~/components/admin/categories'
import { AdminProducts } from '~/components/admin/products'
import { AdminUsers } from '~/components/admin/users'
import { useState } from 'react'

export default function adminView() {
  const [activeView, setActiveView] = useState('')

  const renderActiveView = () => {
    switch (activeView) {
      case 'products':
        return <AdminProducts />
      case 'users':
        return <AdminUsers />
      case 'categories':
        return <AdminCategories />
      default:
        return null
    }
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="h-screen flex justify-center">
      <div className="flex flex-col justify-center items-start gap-4 absolute left-8 top-1/3">
        <button
          className="text-xl"
          onClick={() => handleViewChange('products')}
        >
          products
        </button>
        <button className="text-xl" onClick={() => handleViewChange('users')}>
          users
        </button>
        <button
          className="text-xl"
          onClick={() => handleViewChange('categories')}
        >
          categories
        </button>
      </div>

      <div className="ml-20">{renderActiveView()}</div>
    </div>
  )
}
