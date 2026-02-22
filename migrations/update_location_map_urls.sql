-- Update location Google Maps URLs for Chhindwara and Amgaon
-- Run this in Supabase SQL Editor

-- Update Chhindwara location URL
UPDATE locations
SET google_map_url = 'https://maps.app.goo.gl/DAeC5gLaaMXJeVS49'
WHERE LOWER(city_name) LIKE '%chhindwara%';

-- Update Amgaon location URL
UPDATE locations
SET google_map_url = 'https://maps.app.goo.gl/iGefSiRj5qdPB9br5'
WHERE LOWER(city_name) LIKE '%amgaon%' OR LOWER(city_name) LIKE '%aamgaon%';

-- Show updated locations
SELECT id, city_name, google_map_url, status, display_order FROM locations ORDER BY display_order;
