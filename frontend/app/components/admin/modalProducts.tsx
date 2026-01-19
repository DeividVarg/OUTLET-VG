import { useEffect, useState } from 'react'
import { fetchCategories } from '~/api/categories'
import { updateProduct, createProduct, deleteProduct } from '~/api/poducts'

type Product = {
  id: string
  name: string
  category_id: string
  category_name: string
  price: number
  state: 'available' | 'not available'
  description: string
  urls: string[]
  images: Array<{ id: number; url: string }>
}

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  product?: Product
  loadProducts?: () => void
}

const API_URL = import.meta.env.VITE_API_URL

export const ModalProductsAdmin = ({
  isOpen,
  onClose,
  product,
  loadProducts,
}: ModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: 0,
    state: 'available',
    description: '',
  })

  const [urlsText, setUrlsText] = useState('')
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [images, setImages] = useState<Array<{ id: number; url: string }>>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])

  useEffect(() => {
    if (!isOpen) return
    let aborted = false

    const loadData = async () => {
      try {
        const fetchedCategories = (await fetchCategories()) || []
        const fetchedNormalized = fetchedCategories.map((c: any) => ({
          id: String(c.id),
          name: String(c.name ?? '').trim(),
        }))

        if (product) {
          const targetIdStr = String(product.category_id ?? '')
          const targetName = product.category_name?.trim() ?? ''

          const idxById = fetchedNormalized.findIndex(
            (c) => c.id === targetIdStr
          )
          const idxByName =
            idxById === -1 && targetName
              ? fetchedNormalized.findIndex(
                  (c) => c.name.toLowerCase() === targetName.toLowerCase()
                )
              : -1

          let ordered: Array<{ id: string; name: string }>
          if (idxById !== -1) {
            ordered = [
              fetchedNormalized[idxById],
              ...fetchedNormalized.filter((_, i) => i !== idxById),
            ]
          } else if (idxByName !== -1) {
            ordered = [
              fetchedNormalized[idxByName],
              ...fetchedNormalized.filter((_, i) => i !== idxByName),
            ]
          } else {
            ordered = [
              { id: targetIdStr, name: targetName || 'Categoría del producto' },
              ...fetchedNormalized,
            ]
          }

          const seenIds = new Set<string>()
          const seenNames = new Set<string>()
          const finalList: Array<{ id: string; name: string }> = []
          for (const c of ordered) {
            const nameKey = c.name.trim().toLowerCase()
            if (!seenIds.has(c.id) && !seenNames.has(nameKey)) {
              finalList.push(c)
              seenIds.add(c.id)
              seenNames.add(nameKey)
            }
          }

          if (!aborted) {
            setCategories(finalList)
            setFormData({
              name: product.name || '',
              category_id: targetIdStr || '',
              price: product.price || 0,
              state: product.state || 'available',
              description: product.description || '',
            })
            setUrlsText((product.urls || []).join('\n'))
            setImages(product.images || [])
            setNewFiles([])
            setPreviews([])
          }
        } else {
          if (!aborted) {
            setCategories(fetchedNormalized)
            setFormData({
              name: '',
              category_id: '',
              price: 0,
              state: 'available',
              description: '',
            })
            setUrlsText('')
            setImages([])
            setPreviews([])
            setNewFiles([])
          }
        }
      } catch (err) {
        console.error('Error cargando categorías:', err)
        if (!aborted) setCategories([])
      }
    }

    loadData()
    return () => {
      aborted = true
    }
  }, [isOpen, product])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
    setNewFiles((prev) => [...prev, ...files])
  }

  const handleRemoveImage = (index: number, fromPreview = false) => {
    if (fromPreview) {
      setPreviews((prev) => prev.filter((_, i) => i !== index))
      setNewFiles((prev) => prev.filter((_, i) => i !== index))
    } else {
      setImages((prev) => {
        const img = prev[index]
        if (img?.id) {
          setImagesToDelete((ids) => [...ids, img.id])
        }
        return prev.filter((_, i) => i !== index)
      })
    }
  }

  const handleDelete = () => {
    if (!product) return
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      try {
        deleteProduct(product.id)
        console.log(`Producto con ID eliminado.`)
        window.location.reload()
      } catch (err) {
        console.error('Error eliminando el producto:', err)
      }
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    if (name === 'urls') {
      setUrlsText(value)
      return
    }
    if (name === 'price') {
      const finalValue = parseFloat(value) || 0
      setFormData((prev) => ({ ...prev, price: finalValue }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const urlsArray = urlsText
      .split(/\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
    const body = new FormData()
    body.append('name', formData.name)
    if (formData.category_id) body.append('category_id', formData.category_id)
    body.append('price', formData.price.toString())
    body.append('state', formData.state)
    body.append('description', formData.description)
    body.append('urls', JSON.stringify(urlsArray))
    imagesToDelete.forEach((id) =>
      body.append('imagesToDelete[]', id.toString())
    )
    newFiles.forEach((file) => body.append('images', file))

    try {
      if (product) {
        await updateProduct(product.id, body)
        alert('Producto actualizado con éxito')
      } else {
        await createProduct(body)
        alert('Producto creado con éxito')
      }
      if (loadProducts) await loadProducts()
      onClose()
    } catch (err) {
      console.error('Error:', err)
      alert('Ocurrió un error al guardar.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-3xl"
        onClick={onClose}
      ></div>
      <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-11/12 h-5/6 mx-4 flex flex-col">
        <form
          className="flex flex-col flex-grow overflow-hidden"
          onSubmit={handleSubmit}
        >
          <main className="flex w-full overflow-auto flex-grow space-x-2">
            {/* PANEL IZQUIERDO: IMÁGENES */}
            <div className="lg:w-5/12 flex flex-col overflow-y-auto">
              <h2 className="font-semibold mb-2 text-center text-xl">
                {product ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <div className="w-full h-64 overflow-y-auto grid grid-cols-2 gap-2 p-2 border rounded-lg">
                {images.map((img, i) => (
                  <div key={`img-${i}`} className="relative">
                    <img
                      src={`${API_URL}${img.url}`}
                      className="w-full h-32 object-contain rounded-lg border bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={`prev-${i}`} className="relative">
                    <img
                      src={src}
                      className="w-full h-32 object-contain rounded-lg border bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i, true)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-4 w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors">
                Subir imágenes
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
            </div>

            {/* PANEL DERECHO: FORMULARIO */}
            <div className="flex flex-col lg:w-7/12 overflow-y-auto px-2 space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Categoría</label>
                <select
                  name="category_id"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Precio</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <select
                    name="state"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="available">Disponible</option>
                    <option value="not available">No disponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  URLs de compra
                </label>
                <textarea
                  name="urls"
                  rows={4}
                  placeholder="https://tienda.com/p1&#10;https://tienda.com/p2"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={urlsText}
                  onChange={handleChange}
                />
              </div>
            </div>
          </main>

          <footer className="justify-end w-full mt-6 flex pt-4 border-t">
            <div className="flex space-x-4">
              <button
                type="button"
                className="w-40 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-40 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                {product ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                className="w-40 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}
