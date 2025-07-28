-- Insert sample blog posts with rich content
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  featured_image_url, 
  gallery_images,
  author_id, 
  category_id, 
  status, 
  published_at, 
  reading_time, 
  is_featured
) VALUES 
(
  'The Ultimate Guide to Cancer-Fighting Nutrition',
  'ultimate-guide-cancer-fighting-nutrition',
  'Discover evidence-based nutritional strategies that can help support your body during cancer treatment and recovery.',
  '<h2>Understanding Cancer-Fighting Foods</h2>
  <p>Nutrition plays a crucial role in supporting your body during cancer treatment. Research shows that certain foods contain powerful compounds that may help fight cancer cells and support your immune system.</p>
  
  <h3>Top Cancer-Fighting Foods</h3>
  <ul>
    <li><strong>Cruciferous Vegetables:</strong> Broccoli, cauliflower, and Brussels sprouts contain sulforaphane, a compound with anti-cancer properties.</li>
    <li><strong>Berries:</strong> Rich in antioxidants and vitamin C, berries help protect cells from damage.</li>
    <li><strong>Leafy Greens:</strong> Spinach, kale, and arugula provide folate and other essential nutrients.</li>
    <li><strong>Fatty Fish:</strong> Salmon, mackerel, and sardines offer omega-3 fatty acids that reduce inflammation.</li>
  </ul>
  
  <blockquote>
    "Let food be thy medicine and medicine be thy food." - Hippocrates
  </blockquote>
  
  <h3>Meal Planning Tips</h3>
  <p>Creating a nutrition plan during cancer treatment requires careful consideration of your energy levels, appetite changes, and treatment side effects.</p>
  
  <ol>
    <li>Focus on nutrient-dense foods that provide maximum nutrition per calorie</li>
    <li>Eat small, frequent meals throughout the day</li>
    <li>Stay hydrated with water, herbal teas, and broths</li>
    <li>Work with a registered dietitian who specializes in oncology nutrition</li>
  </ol>
  
  <h3>Managing Treatment Side Effects</h3>
  <p>Different treatments can cause various side effects that affect eating. Here are some strategies:</p>
  
  <h4>For Nausea:</h4>
  <ul>
    <li>Try ginger tea or ginger supplements</li>
    <li>Eat bland, easy-to-digest foods</li>
    <li>Avoid strong smells and spicy foods</li>
  </ul>
  
  <h4>For Loss of Appetite:</h4>
  <ul>
    <li>Choose calorie-dense foods like nuts, avocados, and olive oil</li>
    <li>Use herbs and spices to enhance flavor</li>
    <li>Consider nutritional supplements if recommended by your healthcare team</li>
  </ul>',
  '/images/blog/cancer-nutrition-guide.jpg',
  '["/images/blog/gallery/healthy-foods-1.jpg", "/images/blog/gallery/meal-prep-1.jpg", "/images/blog/gallery/supplements-1.jpg"]',
  (SELECT id FROM blog_authors WHERE name = 'Dr. Sarah Johnson' LIMIT 1),
  (SELECT id FROM blog_categories WHERE slug = 'nutrition-tips' LIMIT 1),
  'published',
  NOW() - INTERVAL '2 days',
  8,
  true
),
(
  'Delicious Anti-Inflammatory Smoothie Recipes',
  'anti-inflammatory-smoothie-recipes',
  'Start your day with these nutrient-packed smoothies designed to reduce inflammation and boost your energy levels.',
  '<h2>Why Anti-Inflammatory Smoothies?</h2>
  <p>Inflammation is a natural response of your immune system, but chronic inflammation can contribute to various health issues. These smoothie recipes are packed with anti-inflammatory ingredients to help your body heal and thrive.</p>
  
  <h3>Green Goddess Smoothie</h3>
  <p>This vibrant green smoothie is perfect for morning energy and contains powerful anti-inflammatory ingredients.</p>
  
  <h4>Ingredients:</h4>
  <ul>
    <li>1 cup fresh spinach</li>
    <li>1/2 avocado</li>
    <li>1 banana</li>
    <li>1 cup unsweetened almond milk</li>
    <li>1 tbsp chia seeds</li>
    <li>1 tsp fresh ginger</li>
    <li>1 tbsp honey (optional)</li>
  </ul>
  
  <h4>Instructions:</h4>
  <ol>
    <li>Add all ingredients to a high-speed blender</li>
    <li>Blend until smooth and creamy</li>
    <li>Add ice if desired for a thicker consistency</li>
    <li>Serve immediately and enjoy!</li>
  </ol>
  
  <h3>Berry Antioxidant Blast</h3>
  <p>Loaded with antioxidants from mixed berries, this smoothie helps fight free radicals and supports immune function.</p>
  
  <h4>Ingredients:</h4>
  <ul>
    <li>1 cup mixed berries (blueberries, strawberries, raspberries)</li>
    <li>1/2 cup Greek yogurt</li>
    <li>1 cup coconut milk</li>
    <li>1 tbsp ground flaxseed</li>
    <li>1 tsp turmeric powder</li>
    <li>1 tsp vanilla extract</li>
  </ul>
  
  <blockquote>
    "The best time to plant a tree was 20 years ago. The second best time is now. The same applies to starting healthy habits."
  </blockquote>
  
  <h3>Golden Turmeric Smoothie</h3>
  <p>Turmeric contains curcumin, one of the most powerful anti-inflammatory compounds found in nature.</p>
  
  <h4>Ingredients:</h4>
  <ul>
    <li>1 banana</li>
    <li>1 cup coconut milk</li>
    <li>1 tsp turmeric powder</li>
    <li>1/2 tsp cinnamon</li>
    <li>1 tbsp almond butter</li>
    <li>1 tsp honey</li>
    <li>Pinch of black pepper (enhances turmeric absorption)</li>
  </ul>
  
  <h3>Tips for Success</h3>
  <ul>
    <li>Prep ingredients the night before for quick morning blending</li>
    <li>Freeze fruits in advance for a thicker, colder smoothie</li>
    <li>Start with less liquid and add more as needed for desired consistency</li>
    <li>Experiment with different combinations to find your favorites</li>
  </ul>',
  '/images/blog/smoothie-recipes.jpg',
  '["/images/blog/gallery/green-smoothie.jpg", "/images/blog/gallery/berry-smoothie.jpg", "/images/blog/gallery/turmeric-smoothie.jpg"]',
  (SELECT id FROM blog_authors WHERE name = 'Lisa Chen' LIMIT 1),
  (SELECT id FROM blog_categories WHERE slug = 'recipes' LIMIT 1),
  'published',
  NOW() - INTERVAL '5 days',
  6,
  true
),
(
  'Understanding Macronutrients During Cancer Treatment',
  'macronutrients-cancer-treatment',
  'Learn how proteins, carbohydrates, and fats play essential roles in supporting your body through cancer treatment.',
  '<h2>The Building Blocks of Nutrition</h2>
  <p>During cancer treatment, your body has increased nutritional needs. Understanding macronutrients—proteins, carbohydrates, and fats—can help you make informed choices about your diet.</p>
  
  <h3>Protein: The Body''s Repair Kit</h3>
  <p>Protein is essential for tissue repair, immune function, and maintaining muscle mass during treatment.</p>
  
  <h4>Best Protein Sources:</h4>
  <ul>
    <li>Lean meats and poultry</li>
    <li>Fish and seafood</li>
    <li>Eggs</li>
    <li>Dairy products</li>
    <li>Legumes and beans</li>
    <li>Nuts and seeds</li>
  </ul>
  
  <h4>Daily Protein Goals:</h4>
  <p>Most adults need 0.8-1.2 grams of protein per kilogram of body weight, but cancer patients may need 1.2-1.5 grams per kilogram.</p>
  
  <h3>Carbohydrates: Your Energy Source</h3>
  <p>Carbohydrates provide the energy your body needs to fight cancer and recover from treatment.</p>
  
  <h4>Choose Complex Carbohydrates:</h4>
  <ul>
    <li>Whole grains (quinoa, brown rice, oats)</li>
    <li>Vegetables</li>
    <li>Fruits</li>
    <li>Legumes</li>
  </ul>
  
  <h3>Healthy Fats: Essential for Healing</h3>
  <p>Fats help with nutrient absorption, hormone production, and reducing inflammation.</p>
  
  <h4>Focus on These Fats:</h4>
  <ul>
    <li>Omega-3 fatty acids (fish, walnuts, flaxseeds)</li>
    <li>Monounsaturated fats (olive oil, avocados)</li>
    <li>Nuts and seeds</li>
  </ul>
  
  <h3>Putting It All Together</h3>
  <p>A balanced meal should include all three macronutrients. Here''s a simple formula:</p>
  
  <ul>
    <li>1/4 of your plate: lean protein</li>
    <li>1/2 of your plate: vegetables and fruits</li>
    <li>1/4 of your plate: whole grains</li>
    <li>Add healthy fats through cooking oils, nuts, or avocado</li>
  </ul>',
  '/images/blog/macronutrients.jpg',
  '["/images/blog/gallery/protein-foods.jpg", "/images/blog/gallery/healthy-carbs.jpg", "/images/blog/gallery/healthy-fats.jpg"]',
  (SELECT id FROM blog_authors WHERE name = 'Dr. Sarah Johnson' LIMIT 1),
  (SELECT id FROM blog_categories WHERE slug = 'nutrition-tips' LIMIT 1),
  'published',
  NOW() - INTERVAL '1 week',
  7,
  false
),
(
  'SmartSpoon Technology: Revolutionizing Nutrition Tracking',
  'smartspoon-technology-nutrition-tracking',
  'Discover how our innovative SmartSpoon technology is changing the way patients and healthcare providers monitor nutritional intake.',
  '<h2>The Future of Nutrition Monitoring</h2>
  <p>Traditional methods of tracking food intake rely on patient self-reporting, which can be inaccurate and burdensome. Our SmartSpoon technology represents a breakthrough in precision nutrition monitoring.</p>
  
  <h3>How SmartSpoon Works</h3>
  <p>The SmartSpoon uses advanced sensors and AI technology to automatically track:</p>
  
  <ul>
    <li>Portion sizes with 95% accuracy</li>
    <li>Nutritional content of foods</li>
    <li>Eating patterns and timing</li>
    <li>Swallowing efficiency</li>
  </ul>
  
  <h3>Benefits for Cancer Patients</h3>
  <p>For patients undergoing cancer treatment, precise nutrition monitoring is crucial:</p>
  
  <h4>Real-time Feedback</h4>
  <p>Patients receive immediate insights about their nutritional intake, helping them make informed decisions about their next meal.</p>
  
  <h4>Healthcare Provider Integration</h4>
  <p>Data is seamlessly shared with healthcare teams, enabling:</p>
  <ul>
    <li>Personalized nutrition recommendations</li>
    <li>Early intervention for nutritional deficiencies</li>
    <li>Treatment plan adjustments based on actual intake</li>
  </ul>
  
  <h3>Clinical Trial Results</h3>
  <p>Our recent clinical trial with 200 cancer patients showed remarkable results:</p>
  
  <ul>
    <li>78% improvement in nutritional goal achievement</li>
    <li>65% reduction in malnutrition risk</li>
    <li>45% decrease in treatment delays due to poor nutrition</li>
  </ul>
  
  <blockquote>
    "The SmartSpoon has transformed how we monitor our patients'' nutrition. The real-time data allows us to intervene early and improve outcomes." - Dr. Michael Chen, Oncology Nutrition Specialist
  </blockquote>
  
  <h3>Looking Ahead</h3>
  <p>We''re continuously improving SmartSpoon technology with upcoming features:</p>
  
  <ul>
    <li>Integration with electronic health records</li>
    <li>Predictive analytics for nutrition planning</li>
    <li>Expanded food database with international cuisines</li>
    <li>Voice-activated meal logging</li>
  </ul>
  
  <h3>Getting Started</h3>
  <p>If you''re interested in incorporating SmartSpoon technology into your care plan, speak with your healthcare provider or contact our team for more information.</p>',
  '/images/blog/smartspoon-tech.jpg',
  '["/images/blog/gallery/smartspoon-device.jpg", "/images/blog/gallery/app-interface.jpg", "/images/blog/gallery/clinical-trial.jpg"]',
  (SELECT id FROM blog_authors WHERE name = 'Mark Thompson' LIMIT 1),
  (SELECT id FROM blog_categories WHERE slug = 'smartspoon-updates' LIMIT 1),
  'published',
  NOW() - INTERVAL '3 days',
  5,
  true
),
(
  'Meal Prep Strategies for Cancer Patients',
  'meal-prep-strategies-cancer-patients',
  'Learn practical meal preparation techniques that can help maintain good nutrition even when energy levels are low.',
  '<h2>Making Nutrition Accessible During Treatment</h2>
  <p>Cancer treatment can leave you feeling tired and overwhelmed. Meal prepping is a powerful strategy to ensure you always have nutritious options available, even on your most challenging days.</p>
  
  <h3>Getting Started with Meal Prep</h3>
  <p>The key to successful meal prep is starting small and building sustainable habits.</p>
  
  <h4>Essential Equipment:</h4>
  <ul>
    <li>Glass storage containers in various sizes</li>
    <li>Sharp knives and cutting boards</li>
    <li>Slow cooker or Instant Pot</li>
    <li>Freezer-safe bags and labels</li>
  </ul>
  
  <h3>Batch Cooking Basics</h3>
  <p>Focus on preparing versatile ingredients that can be mixed and matched throughout the week.</p>
  
  <h4>Proteins to Prep:</h4>
  <ul>
    <li>Baked chicken breast or thighs</li>
    <li>Hard-boiled eggs</li>
    <li>Cooked beans and lentils</li>
    <li>Baked tofu or tempeh</li>
  </ul>
  
  <h4>Grains and Starches:</h4>
  <ul>
    <li>Brown rice or quinoa</li>
    <li>Sweet potatoes</li>
    <li>Whole grain pasta</li>
    <li>Overnight oats</li>
  </ul>
  
  <h4>Vegetables:</h4>
  <ul>
    <li>Roasted vegetables (broccoli, carrots, bell peppers)</li>
    <li>Steamed greens</li>
    <li>Raw vegetables for snacking</li>
  </ul>
  
  <h3>Freezer-Friendly Meals</h3>
  <p>Prepare complete meals that can be frozen and reheated when needed:</p>
  
  <h4>Soup and Stew Ideas:</h4>
  <ul>
    <li>Chicken and vegetable soup</li>
    <li>Lentil and sweet potato stew</li>
    <li>Bone broth with added vegetables</li>
  </ul>
  
  <h4>Smoothie Packs:</h4>
  <p>Pre-portion smoothie ingredients in freezer bags:</p>
  <ul>
    <li>Fruits and vegetables</li>
    <li>Protein powder</li>
    <li>Seeds and nuts</li>
  </ul>
  
  <h3>Energy-Saving Tips</h3>
  <p>When energy is limited, these strategies can help:</p>
  
  <ul>
    <li>Prep on days when you feel good</li>
    <li>Ask family and friends to help</li>
    <li>Use pre-cut vegetables when needed</li>
    <li>Keep simple backup meals on hand</li>
  </ul>
  
  <h3>Sample Weekly Prep Schedule</h3>
  <p>Here''s a manageable approach to meal prep:</p>
  
  <h4>Sunday (2-3 hours):</h4>
  <ul>
    <li>Cook grains and proteins</li>
    <li>Wash and chop vegetables</li>
    <li>Prepare one-pot meals for freezing</li>
  </ul>
  
  <h4>Wednesday (30 minutes):</h4>
  <ul>
    <li>Refresh vegetables</li>
    <li>Prepare smoothie packs</li>
    <li>Check and rotate freezer meals</li>
  </ul>',
  '/images/blog/meal-prep.jpg',
  '["/images/blog/gallery/meal-prep-containers.jpg", "/images/blog/gallery/batch-cooking.jpg", "/images/blog/gallery/freezer-meals.jpg"]',
  (SELECT id FROM blog_authors WHERE name = 'Lisa Chen' LIMIT 1),
  (SELECT id FROM blog_categories WHERE slug = 'recipes' LIMIT 1),
  'published',
  NOW() - INTERVAL '1 week',
  6,
  false
);

-- Insert post-tag relationships
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT 
  bp.id,
  bt.id
FROM blog_posts bp, blog_tags bt
WHERE 
  (bp.slug = 'ultimate-guide-cancer-fighting-nutrition' AND bt.slug IN ('cancer-care', 'nutrition-science', 'tips')) OR
  (bp.slug = 'anti-inflammatory-smoothie-recipes' AND bt.slug IN ('recipe', 'healthy-eating', 'lifestyle')) OR
  (bp.slug = 'macronutrients-cancer-treatment' AND bt.slug IN ('cancer-care', 'nutrition-science', 'tips')) OR
  (bp.slug = 'smartspoon-technology-nutrition-tracking' AND bt.slug IN ('research', 'nutrition-science')) OR
  (bp.slug = 'meal-prep-strategies-cancer-patients' AND bt.slug IN ('meal-planning', 'tips', 'lifestyle'));
