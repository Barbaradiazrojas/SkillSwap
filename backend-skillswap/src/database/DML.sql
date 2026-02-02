INSERT INTO usuarios (nombre, apellido, email, password, avatar_url, es_verificado) VALUES
('Juan', 'Pérez', 'juan@example.com', '$2b$10$abcdefg123456', 'https://ui-avatars.com/api/?name=Juan+Perez', true),
('María', 'González', 'maria@example.com', '$2b$10$hijklmn789012', 'https://ui-avatars.com/api/?name=Maria+Gonzalez', true);

INSERT INTO skills (id_usuario, titulo, descripcion, categoria, nivel, modalidad, duracion_horas, imagen_url, precio) VALUES
(1, 'Clases de Guitarra', 'Aprende a tocar guitarra desde cero', 'Música', 'Principiante', 'Online', 20, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', 15000),
(2, 'Diseño UI/UX', 'Diseño de interfaces modernas', 'Diseño', 'Intermedio', 'Online', 30, 'https://images.unsplash.com/photo-1561070791-2526d30994b5', 25000);

CREATE INDEX idx_skills_categoria ON skills(categoria);
CREATE INDEX idx_skills_nivel ON skills(nivel);
CREATE INDEX idx_skills_usuario ON skills(id_usuario);
CREATE INDEX idx_favoritos_usuario ON favoritos(id_usuario);
CREATE INDEX idx_carrito_usuario ON carrito(id_usuario);

COMMENT ON TABLE publicaciones IS 'Publicaciones de usuarios en la plataforma';
COMMENT ON TABLE imagenes_publicacion IS 'Múltiples imágenes asociadas a una publicación';
COMMENT ON TABLE imagenes_skill IS 'Galería de imágenes para mostrar detalles de un skill';


CREATE INDEX idx_publicaciones_usuario ON publicaciones(id_usuario);
CREATE INDEX idx_publicaciones_skill ON publicaciones(id_skill);
CREATE INDEX idx_imagenes_publicacion ON imagenes_publicacion(id_publicacion);
CREATE INDEX idx_imagenes_skill ON imagenes_skill(id_skill);

