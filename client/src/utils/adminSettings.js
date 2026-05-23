import { settingsSections } from "../data/adminData.js";

export const SETTINGS_NAV = [
  { id: "general", label: "General" },
  { id: "payments", label: "Payments" },
  { id: "preferences", label: "Preferences" },
];

export const CURRENCIES = ["EUR", "USD", "GBP"];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export function createInitialSettings() {
  return {
    general: {
      appName: settingsSections.general.appName,
      tagline: settingsSections.general.tagline,
      logo: settingsSections.general.logo,
      brandColor: settingsSections.general.primaryColor,
    },
    payments: {
      stripeEnabled: settingsSections.payments.stripeEnabled,
      paypalEnabled: settingsSections.payments.paypalEnabled,
      defaultCurrency: settingsSections.payments.currencies[0] ?? "EUR",
    },
    preferences: {
      language: "en",
      notifications: settingsSections.notifications.emailNotifications,
    },
  };
}
