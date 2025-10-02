
export const Footer = () => {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 place-items-center place-self-center-safe border-t-1 py-4">
      <section >
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit neque
        quia molestiae numquam. Voluptas labore voluptatum libero nisi eveniet
        quasi natus iure officiis accusantium quibusdam dolore optio explicabo,
        veniam sit?
      </section>

      <section className="space-y-3">
        <h5>Nuestras Redes </h5>
        <ul className="flex flex-row space-x-4">
          <ol>
            <h5>Instagram</h5>
            <section></section>
          </ol>
          <ol>
            <h5>Facebook</h5>
            <section></section>
          </ol>
          <ol>
            <h5>Whatsapp</h5>
            <section></section>
          </ol>
          <ol>
            <h6>Mercado Libre</h6>
          </ol>
        </ul>
      </section>

      <section className="">
        <h5>Reseñanos</h5>
        <form
          action=""
          method="post"
          className="flex justify-center items-start space-x-3"
        >
          <input type="email" placeholder="TuCorreo@gmail.com" className=''/>
          <textarea className="" placeholder="Tu reseña"></textarea>
        </form>
      </section>
    </div>
  )
}