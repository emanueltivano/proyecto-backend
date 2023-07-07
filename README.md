# Proyecto Backend

Este es un proyecto hecho para el curso de Programación Backend de Coderhouse. El objetivo de este proyecto es crear el backend para un e-commerce.

## Levantar el servidor

Para levantar el servidor, primero debes instalar las dependencias del proyecto ejecutando el comando:

```bash
npm install
```

Luego, puedes levantar el servidor ejecutando el comando:

```bash
npm start
```

El servidor estará corriendo en el puerto 8080.

## Endpoints

El servidor cuenta con los siguientes endpoints para productos y carritos:

### Productos

La API permite realizar las siguientes operaciones con productos:

- `GET /api/products`: Obtiene todos los productos.

- `GET /api/products/:pid`: Obtiene un producto específico por su ID.

- `POST /api/products`: Crea un nuevo producto.

- `PUT /api/products/:pid`: Actualiza un producto existente.

- `DELETE /api/products/:pid`: Elimina un producto existente.

### Carritos

La API permite realizar las siguientes operaciones con carritos:

- `GET /api/carts/:cid`: Obtiene un carrito específico por su ID.

- `POST /api/carts`: Crea un nuevo carrito vacio.

- `PUT /api/carts/:cid/product/:pid`: Agrega un producto a un carrito existente.

## Autor

Este proyecto fue creado por Emanuel Tivano.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para obtener más información.