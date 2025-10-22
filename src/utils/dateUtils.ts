// src/utils/dateUtils.ts
/**
 * Format a date string to a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date string or "N/A" if invalid
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Format a date and time string to a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date and time string or "N/A" if invalid
 */
export const formatDateTime = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Format a date string with consistent UTC timezone handling
 * @param dateString - The date string to format
 * @returns Formatted date string or "N/A" if invalid
 */
export const formatDateUTC = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return "N/A";
  try {
    // Parse the date string and ensure UTC timezone handling
    const date = new Date(dateString);

    // If the date is invalid, return "N/A"
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    // Format with UTC to ensure consistency across client and server
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "N/A";
  }
};
