-- Demo seed data for local development
-- Run: psql -U postgres -d clean_label_db -f backend/db/seeds/demo.sql
--
-- Demo credentials:
--   Email:    admin@cleanlabel.com
--   Password: password123

-- Admin user (bcrypt hash of "password123")
INSERT INTO users (email, password_hash, role)
VALUES ('admin@cleanlabel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample products with pre-computed AI audit results
INSERT INTO products (name, description, price, image_url, ingredients, is_safe, ai_reason, ai_checked_at, created_by)
VALUES
(
  'Pure Aloe Vera Gel',
  'A lightweight, alcohol-free gel made from 99% pure aloe vera. Perfect for sensitive skin.',
  14.99,
  'https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=400',
  'Aloe Barbadensis Leaf Juice (99%), Xanthan Gum, Citric Acid (0.1%), Potassium Sorbate',
  true,
  'All ingredients are clean-label compliant. Citric acid is well below the 5% threshold and used only as a pH stabilizer.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Xylitol Mint Toothpaste',
  'A fluoride-free, SLS-free toothpaste with xylitol and peppermint. No alcohol, no synthetic dyes.',
  12.50,
  'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400',
  'Water, Calcium Carbonate, Xylitol, Glycerin, Peppermint Oil, Carrageenan, Sodium Bicarbonate',
  true,
  'No flagged ingredients. Free from SLS, parabens, alcohol, and synthetic dyes. Xylitol is a clean-label sweetener.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Organic Coconut Oil Moisturizer',
  'Cold-pressed coconut oil blended with shea butter. Zero preservatives, zero fragrance.',
  18.00,
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
  'Cocos Nucifera (Coconut) Oil, Butyrospermum Parkii (Shea) Butter, Tocopherol (Vitamin E)',
  true,
  'Fully clean-label. Only 3 ingredients, all naturally derived. No synthetic additives detected.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Brightening Face Wash',
  'A foaming face wash with instant brightening effect.',
  9.99,
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
  'Water, Sodium Lauryl Sulfate, Glycerin, Cocamidopropyl Betaine, Red 40, Methylparaben, Citric Acid, Fragrance',
  false,
  'Flagged: Sodium Lauryl Sulfate (SLS), Red 40 (synthetic dye), and Methylparaben (paraben) detected. Does not meet clean-label standards.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Rosewater Facial Toner',
  'A gentle, alcohol-free toner with Bulgarian rosewater and hyaluronic acid. Balances pH naturally.',
  16.00,
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400',
  'Rosa Damascena Flower Water, Sodium Hyaluronate, Glycerin, Niacinamide, Potassium Sorbate',
  true,
  'All ingredients are clean-label compliant. No alcohol, parabens, SLS, or synthetic dyes detected.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Charcoal Detox Face Mask',
  'A deep-cleansing mask with activated charcoal and kaolin clay. Draws out impurities without stripping the skin.',
  22.00,
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
  'Kaolin Clay, Activated Charcoal, Bentonite, Aloe Barbadensis Leaf Juice, Glycerin, Lavender Essential Oil',
  true,
  'Clean-label compliant. All ingredients are naturally derived. No synthetic preservatives, dyes, or surfactants.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Peppermint Castile Soap',
  'A versatile liquid soap made with organic olive oil and peppermint essential oil. 100% biodegradable.',
  13.50,
  'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400',
  'Water, Potassium Cocoate, Potassium Olivate, Glycerin, Mentha Piperita (Peppermint) Oil, Citric Acid',
  true,
  'Fully clean-label. Plant-derived surfactants only. No SLS, SLES, parabens, or synthetic dyes.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Kids Bubble Bath',
  'Extra-gentle bubble bath for sensitive toddler skin with a fun bubblegum scent.',
  8.99,
  'https://images.unsplash.com/photo-1571867424488-4565932edb41?w=400',
  'Water, Sodium Laureth Sulfate, Cocamide DEA, Blue 1, Yellow 5, Fragrance, Methylparaben, Propylparaben',
  false,
  'Flagged: Sodium Laureth Sulfate (SLES), Blue 1 and Yellow 5 (synthetic dyes), Methylparaben and Propylparaben (parabens). Not safe for clean-label listing.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
),
(
  'Anti-Aging Night Cream',
  'A rich overnight repair cream with retinol and peptides.',
  34.99,
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
  'Water, Glycerin, Retinol, Palmitoyl Tripeptide-1, Isopropanol, Butylparaben, Ethylparaben, Phenoxyethanol',
  false,
  'Flagged: Isopropanol (alcohol derivative) and Butylparaben + Ethylparaben (parabens) detected. Does not meet clean-label standards.',
  NOW(),
  (SELECT id FROM users WHERE email = 'admin@cleanlabel.com')
);
