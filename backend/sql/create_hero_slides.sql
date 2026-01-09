-- Create table for hero slides management
CREATE TABLE IF NOT EXISTS content_hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(255) DEFAULT '',
  subtitle VARCHAR(255) DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example data (optional)
-- INSERT INTO content_hero_slides (image_url, title, subtitle, display_order) VALUES
-- ('https://example.com/pizza.jpg', 'Pizzas Artisanales', 'Cuites au feu de bois', 1),
-- ('https://example.com/nature.jpg', 'Ingrédients Bio', 'Frais et locaux', 2);
