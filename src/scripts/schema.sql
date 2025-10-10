-- Limpiar tablas
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS categories;

-- Crear tablas
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  date_added TEXT,
  rating REAL,
  category_id TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insertar categorías
INSERT INTO categories (id, name) VALUES
('productivity', 'Productividad'),
('learning', 'Aprendizaje'),
('entertainment', 'Entretenimiento'),
('tools', 'Herramientas'),
('social', 'Redes Sociales'),
('news', 'Noticias'),
('shopping', 'Compras'),
('travel', 'Viajes');

-- Insertar algunos links de ejemplo (puedes seguir este patrón)
INSERT INTO links (id, name, description, url, date_added, rating, category_id) VALUES
('1', 'Notion', 'Herramienta todo en uno para notas, tareas y bases de datos', 'https://notion.so', '2023-05-15', 4.8, 'productivity'),
('2', 'Todoist', 'Gestor de tareas simple y potente', 'https://todoist.com', '2023-04-10', 4.5, 'productivity'),
('3', 'Trello', 'Organización visual de proyectos con tableros Kanban', 'https://trello.com', '2023-03-22', 4.3, 'productivity'),
('4', 'Coursera', 'Plataforma de cursos online de universidades', 'https://coursera.org', '2023-06-05', 4.6, 'learning'),
('5', 'Khan Academy', 'Educación gratuita para todos', 'https://khanacademy.org', '2023-02-18', 4.9, 'learning'),
('6', 'freeCodeCamp', 'Aprende a programar gratis', 'https://freecodecamp.org', '2023-01-30', 4.7, 'learning'),
('7', 'Netflix', 'Servicio de streaming de películas y series', 'https://netflix.com', '2023-07-12', 4.7, 'entertainment'),
('8', 'Spotify', 'Plataforma de música en streaming', 'https://spotify.com', '2023-05-28', 4.8, 'entertainment'),
('9', 'YouTube', 'Plataforma de videos online', 'https://youtube.com', '2023-04-15', 4.9, 'entertainment'),
('10', 'Canva', 'Diseño gráfico simplificado', 'https://canva.com', '2023-06-20', 4.6, 'tools'),
('11', 'Figma', 'Herramienta de diseño colaborativo', 'https://figma.com', '2023-03-10', 4.8, 'tools'),
('12', 'ChatGPT', 'Asistente de IA conversacional', 'https://chat.openai.com', '2023-02-05', 4.9, 'tools'),
('33', 'Twitter', 'Red social de microblogging', 'https://twitter.com', '2023-07-01', 4.2, 'social'),
('34', 'Instagram', 'Red social de fotos y videos', 'https://instagram.com', '2023-06-15', 4.5, 'social'),
('35', 'LinkedIn', 'Red social profesional', 'https://linkedin.com', '2023-05-20', 4.4, 'social'),
('41', 'BBC News', 'Servicio de noticias internacional', 'https://bbc.com/news', '2023-07-05', 4.5, 'news'),
('42', 'The New York Times', 'Periódico estadounidense de renombre', 'https://nytimes.com', '2023-06-20', 4.6, 'news'),
('43', 'El País', 'Diario español de información general', 'https://elpais.com', '2023-05-15', 4.3, 'news'),
('49', 'Amazon', 'Tienda online con millones de productos', 'https://amazon.com', '2023-07-10', 4.7, 'shopping'),
('50', 'eBay', 'Plataforma de compra y venta online', 'https://ebay.com', '2023-06-25', 4.3, 'shopping'),
('51', 'AliExpress', 'Plataforma de compras internacional', 'https://aliexpress.com', '2023-05-20', 4.1, 'shopping'),
('57', 'Booking.com', 'Reserva de hoteles y alojamientos', 'https://booking.com', '2023-07-15', 4.6, 'travel'),
('58', 'Airbnb', 'Alquiler de alojamientos y experiencias', 'https://airbnb.com', '2023-06-30', 4.7, 'travel'),
('59', 'TripAdvisor', 'Reseñas de hoteles, restaurantes y atracciones', 'https://tripadvisor.com', '2023-05-25', 4.5, 'travel');
