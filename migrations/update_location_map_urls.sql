-- Update location Google Maps Embed URLs for Chhindwara and Amgaon
-- These use the Google Maps Embed API with actual city coordinates
-- Run this in the Supabase SQL Editor

-- Chhindwara: coordinates 22.057163, 78.938202 (city center Madhya Pradesh)
UPDATE locations
SET google_map_url = 'https://maps.google.com/maps?q=22.057163,78.938202&z=15&output=embed'
WHERE LOWER(city_name) LIKE '%chhindwara%';

-- Amgaon: coordinates 21.370428, 80.377066 (Amgaon, Gondia Maharashtra)
UPDATE locations
SET google_map_url = 'https://maps.google.com/maps?q=21.370428,80.377066&z=15&output=embed'
WHERE LOWER(city_name) LIKE '%amgaon%' OR LOWER(city_name) LIKE '%aamgaon%';

-- Show updated results
SELECT id, city_name, google_map_url, status, display_order FROM locations ORDER BY display_order;
