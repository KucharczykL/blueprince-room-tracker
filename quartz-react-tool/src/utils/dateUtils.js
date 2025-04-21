import { START_DATE } from '../constants';

/**
 * Calculates the calendar date for a given day number.
 * @param {number} dayNumber - The day number (1-based).
 * @returns {string} - Formatted date string (e.g., "November 7, 1993").
 */
export function getCalendarDateForDay(dayNumber) {
    if (dayNumber < 1 || isNaN(dayNumber)) {
        return "Invalid Day";
    }
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + dayNumber - 1); // Add (dayNumber - 1) days
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
