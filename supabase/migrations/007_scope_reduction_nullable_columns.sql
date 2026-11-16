-- ============================================================================
-- MIGRATION 007: SCOPE REDUCTION — MAKE LEGACY NUTRITION & INGREDIENT COLUMNS NULLABLE
-- ============================================================================
-- Uses ALTER statements only. Does NOT drop any tables, columns, or data.
-- Ensures saving menus and menu_items without nutrition, serving_size, or
-- ingredients succeeds cleanly even when the frontend omits those columns.
-- ============================================================================

ALTER TABLE public.menus
  ALTER COLUMN total_calories DROP NOT NULL,
  ALTER COLUMN total_calories SET DEFAULT 0,
  ALTER COLUMN total_protein DROP NOT NULL,
  ALTER COLUMN total_protein SET DEFAULT 0,
  ALTER COLUMN total_carbs DROP NOT NULL,
  ALTER COLUMN total_carbs SET DEFAULT 0,
  ALTER COLUMN total_fats DROP NOT NULL,
  ALTER COLUMN total_fats SET DEFAULT 0;

ALTER TABLE public.menu_items
  ALTER COLUMN serving_size DROP NOT NULL,
  ALTER COLUMN serving_size SET DEFAULT NULL,
  ALTER COLUMN calories DROP NOT NULL,
  ALTER COLUMN calories SET DEFAULT 0,
  ALTER COLUMN protein DROP NOT NULL,
  ALTER COLUMN protein SET DEFAULT 0,
  ALTER COLUMN carbs DROP NOT NULL,
  ALTER COLUMN carbs SET DEFAULT 0,
  ALTER COLUMN fats DROP NOT NULL,
  ALTER COLUMN fats SET DEFAULT 0,
  ALTER COLUMN ingredients DROP NOT NULL,
  ALTER COLUMN ingredients SET DEFAULT '{}'::text[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'menu_items'
      AND column_name = 'ingredient_quantities'
  ) THEN
    ALTER TABLE public.menu_items
      ALTER COLUMN ingredient_quantities DROP NOT NULL,
      ALTER COLUMN ingredient_quantities SET DEFAULT '[]'::jsonb;
  END IF;
END $$;
