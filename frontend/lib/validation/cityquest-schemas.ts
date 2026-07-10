import { z } from "zod";

export const languageSchema = z.enum(["ru", "en", "ro"]);

export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

export const loginSchema = z.object({
  device_name: z.string().max(100).optional(),
  email: z.email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    device_name: z.string().max(100).optional(),
    email: z.email(),
    name: z.string().min(2).max(255),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    preferred_city_id: z.number().int().positive().nullable().optional(),
    preferred_language: languageSchema.optional(),
    preferred_theme: themePreferenceSchema.optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords must match.",
    path: ["password_confirmation"],
  });

export const generateRouteSchema = z.object({
  budget_mode: z.enum(["free", "low", "medium", "any"]).optional(),
  category_ids: z.array(z.number().int().positive()).max(12).optional(),
  city_id: z.number().int().positive(),
  date: z.string().optional(),
  duration_minutes: z.number().int().min(60).max(480).optional(),
  interests: z.array(z.string().min(1).max(80)).max(12).optional(),
  place_mode: z.enum(["verified_only", "include_community"]).optional(),
  preferred_day: z.string().optional(),
  route_type: z.string().max(50).optional(),
  vibe: z.string().max(50).optional(),
});

export const storePlaceSchema = z
  .object({
    address: z.string().max(255).nullable().optional(),
    average_price_max: z.number().min(0).max(999_999.99).nullable().optional(),
    average_price_min: z.number().min(0).max(999_999.99).nullable().optional(),
    category_id: z.number().int().positive(),
    city_id: z.number().int().positive(),
    currency_code: z.string().length(3).nullable().optional(),
    description: z.string().min(10).max(5000),
    external_source_url: z.url().max(2048).nullable().optional(),
    google_maps_url: z.url().max(2048).nullable().optional(),
    image_url: z.string().max(2048).nullable().optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string().min(2).max(255),
    official_url: z.url().max(2048).nullable().optional(),
    short_description: z.string().max(255).nullable().optional(),
    visit_duration_minutes: z.number().int().min(5).max(600).nullable().optional(),
    yandex_maps_url: z.url().max(2048).nullable().optional(),
  })
  .refine(
    (data) =>
      data.average_price_min === undefined ||
      data.average_price_min === null ||
      data.average_price_max === undefined ||
      data.average_price_max === null ||
      data.average_price_max >= data.average_price_min,
    {
      message: "Maximum price must be greater than or equal to minimum price.",
      path: ["average_price_max"],
    },
  );

export const updateProfileSchema = z.object({
  avatar_url: z.string().max(2048).nullable().optional(),
  name: z.string().min(2).max(255).optional(),
  preferred_city_id: z.number().int().positive().nullable().optional(),
  preferred_language: languageSchema.optional(),
  preferred_theme: themePreferenceSchema.optional(),
});

export type GenerateRouteFormValues = z.infer<typeof generateRouteSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type StorePlaceFormValues = z.infer<typeof storePlaceSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
