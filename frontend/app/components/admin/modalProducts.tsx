import { useState, useEffect } from "react"

type Product = {
  name: string
  category: string
  price: number
  state: "available" | "not available"
  description: string
  images: string[] // URLs existentes en la BD
}

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  product?: Product // producto a editar
}

export const ModalProductsAdmin = ({ isOpen, onClose, product }: ModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    state: "",
    description: "",
  })
  const [images, setImages] = useState<string[]>([]) // imágenes existentes
  const [previews, setPreviews] = useState<string[]>([]) // nuevas imágenes

  // Cuando se abra el modal
  useEffect(() => {
    if (!isOpen) return

    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        state: product.state,
        description: product.description,
      })
      setImages(product.images || [])
    } else {
      // si es creación nueva
      setFormData({
        name: "",
        category: "",
        price: 0,
        state: "",
        description: "",
      })
      setImages([])
      setPreviews([])
    }
  }, [isOpen, product])

  // Subida de imágenes nuevas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
    // enviar files al backend al guardar
  }

  // Eliminar imagen
  const handleRemoveImage = (index: number, fromPreview = false) => {
    if (fromPreview) {
      setPreviews((prev) => prev.filter((_, i) => i !== index))
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index))
      // eliminar del backend si es necesario
    }
  }

  // Manejar cambios de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // enviar formData + images + previews al backend
    console.log({ formData, images, previews })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

      <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-10/12 h-8/12 mx-4 lg:flex justify-center">
        <main className="flex w-full">
          {/* Panel de imágenes */}
          <div className="lg:w-1/2 flex flex-col items-center">
            <h2 className="font-semibold mb-2">{product ? "Editar producto" : "Nuevo producto"}</h2>

            <div className="w-full h-64 overflow-auto grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt={`img-${i}`} className="w-full h-32 object-contain rounded-lg border" />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`preview-${i}`} className="w-full h-32 object-contain rounded-lg border" />
                  <button
                    onClick={() => handleRemoveImage(i, true)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <label className="mt-4 w-full cursor-pointer bg-blue-500 text-white text-center py-2 rounded-lg">
              Subir imágenes
              <input type="file" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Formulario */}
          <form className="flex flex-col lg:w-1/2 lg:ml-4" onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input
              name="name"
              type="text"
              className="border p-1 rounded"
              value={formData.name}
              onChange={handleChange}
            />

            <label>Categoria</label>
            <input
              name="category"
              type="text"
              className="border p-1 rounded"
              value={formData.category}
              onChange={handleChange}
            />

            <label>Precio</label>
            <input
              name="price"
              type="number"
              className="border p-1 rounded"
              value={formData.price}
              onChange={handleChange}
            />

            <label>Estado</label>
            <select name="state" className="border p-1 rounded" value={formData.state} onChange={handleChange}>
              <option value="">Selecciona estado</option>
              <option value="not available">No disponible</option>
              <option value="available">Disponible</option>
            </select>

            <label>Descripción</label>
            <textarea
              name="description"
              cols={30}
              rows={3}
              className="border p-1 rounded"
              value={formData.description}
              onChange={handleChange}
            />

            <button className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2">
              {product ? "Actualizar" : "Guardar"}
            </button>
          </form>
        </main>

        <button
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg absolute bottom-3 left-2"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
