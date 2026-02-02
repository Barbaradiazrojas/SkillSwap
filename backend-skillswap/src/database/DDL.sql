CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_intercambios INTEGER DEFAULT 0,
    es_verificado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
    id_skill SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    nivel VARCHAR(20) CHECK (nivel IN ('Principiante', 'Intermedio', 'Avanzado')),
    modalidad VARCHAR(20) CHECK (modalidad IN ('Online', 'Presencial', 'Híbrido')),
    duracion_horas INTEGER,
    imagen_url VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_resenas INTEGER DEFAULT 0,
    es_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_skill INTEGER NOT NULL REFERENCES skills(id_skill) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario, id_skill)
);

CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE items_carrito (
    id_item SERIAL PRIMARY KEY,
    id_carrito INTEGER NOT NULL REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    id_skill INTEGER NOT NULL REFERENCES skills(id_skill) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_carrito, id_skill)
);


CREATE TABLE ordenes (
    id_orden SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'pendiente',
    precio_total DECIMAL(10, 2) NOT NULL,
    snapshot_datos JSONB,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE items_orden (
    id_item SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden) ON DELETE CASCADE,
    id_skill INTEGER NOT NULL REFERENCES skills(id_skill),
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    snapshot_datos JSONB,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE resenas (
    id_resena SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_skill INTEGER NOT NULL REFERENCES skills(id_skill) ON DELETE CASCADE,
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario, id_skill)
);


CREATE TABLE publicaciones (
    id_publicacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_skill INTEGER REFERENCES skills(id_skill) ON DELETE SET NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE imagenes_publicacion (
    id_imagen SERIAL PRIMARY KEY,
    id_publicacion INTEGER NOT NULL REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE imagenes_skill (
    id_imagen SERIAL PRIMARY KEY,
    id_skill INTEGER NOT NULL REFERENCES skills(id_skill) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

