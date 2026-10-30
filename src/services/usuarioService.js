import api from "./api";

// =========================
// Normalizar usuario
// =========================

export const formatearUsuario = (usuario) => {
  if (!usuario) {
    return null;
  }

  return {
    id:
      usuario.id ||
      usuario.uid ||
      null,

    uid:
      usuario.uid ||
      usuario.id ||
      null,

    Usuariokey:
      usuario.Usuariokey ||
      usuario.usuarioKey ||
      "",

    Nombre:
      usuario.Nombre ||
      usuario.nombre ||
      "",

    Correo:
      usuario.Correo ||
      usuario.correo ||
      "",

    Telefono:
      usuario.Telefono ||
      usuario.telefono ||
      "",

    Direccion:
      usuario.Direccion ||
      usuario.direccion ||
      "",

    Rol:
      usuario.Rol ||
      usuario.rol ||
      "Cliente",

    activo:
      usuario.activo !== false,

    fechaCreacion:
      usuario.fechaCreacion ||
      null,
  };
};

// =========================
// Obtener todos los usuarios
// GET /api/usuarios
// =========================

export async function obtenerUsuarios() {
  try {
    const respuesta = await api.get(
      "/usuarios"
    );

    const lista = Array.isArray(
      respuesta.data
    )
      ? respuesta.data
      : respuesta.data.usuarios || [];

    return lista.map(formatearUsuario);
  } catch (error) {
    console.log(
      "Error obteniendo usuarios:",
      {
        mensaje:
          error.response?.data?.mensaje ||
          error.message,

        estado:
          error.response?.status,

        datos:
          error.response?.data,
      }
    );

    throw error;
  }
}

// =========================
// Obtener usuario por ID
// GET /api/usuarios/:id
// =========================

export async function obtenerUsuario(id) {
  try {
    const respuesta = await api.get(
      `/usuarios/${id}`
    );

    return formatearUsuario(
      respuesta.data.usuario ||
      respuesta.data
    );
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    console.log(
      "Error obteniendo usuario:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Crear usuario
// POST /api/usuarios
// =========================

export async function crearUsuario(datos) {
  try {
    const cuerpo = {
      Usuariokey:
        datos.Usuariokey || "",

      Nombre:
        datos.Nombre?.trim() || "",

      Correo:
        datos.Correo
          ?.trim()
          .toLowerCase() || "",

      Telefono:
        datos.Telefono?.trim() || "",

      Direccion:
        datos.Direccion?.trim() || "",

      Rol:
        datos.Rol || "Cliente",

      Contraseña:
        datos.Contraseña ||
        datos.contrasena ||
        "",
    };

    const respuesta = await api.post(
      "/usuarios",
      cuerpo
    );

    return formatearUsuario(
      respuesta.data.usuario || {
        id: respuesta.data.id,
        ...cuerpo,
      }
    );
  } catch (error) {
    console.log(
      "Error creando usuario:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Actualizar usuario
// PATCH /api/usuarios/:id
// =========================

export async function actualizarUsuario(
  id,
  datos
) {
  try {
    /*
     * No enviamos contraseña en las actualizaciones
     * del perfil. Firebase Authentication administra
     * la contraseña.
     */
    const cuerpo = {};

    if (datos.Nombre !== undefined) {
      cuerpo.Nombre = datos.Nombre.trim();
    }

    if (datos.Telefono !== undefined) {
      cuerpo.Telefono =
        datos.Telefono.trim();
    }

    if (datos.Direccion !== undefined) {
      cuerpo.Direccion =
        datos.Direccion.trim();
    }

    if (datos.Rol !== undefined) {
      cuerpo.Rol = datos.Rol;
    }

    if (datos.activo !== undefined) {
      cuerpo.activo = datos.activo;
    }

    if (datos.Usuariokey !== undefined) {
      cuerpo.Usuariokey =
        datos.Usuariokey;
    }

    const respuesta = await api.patch(
      `/usuarios/${id}`,
      cuerpo
    );

    return formatearUsuario(
      respuesta.data.usuario ||
      respuesta.data
    );
  } catch (error) {
    console.log(
      "Error actualizando usuario:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

// =========================
// Eliminar usuario
// DELETE /api/usuarios/:id
// =========================

export async function eliminarUsuario(id) {
  try {
    const respuesta = await api.delete(
      `/usuarios/${id}`
    );

    return respuesta.data;
  } catch (error) {
    console.log(
      "Error eliminando usuario:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}