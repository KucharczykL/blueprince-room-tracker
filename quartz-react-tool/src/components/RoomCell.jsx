// src/components/RoomCell.jsx
import React from 'react';
import clsx from 'clsx';
import { COLOR_NAME_TO_VALUE } from '../constants';

/**
 * Determines a contrasting text color (black or white) for a given background hex color.
 * @param {string | null} hexColor - Background color in hex format (e.g., "#RRGGBB") or null.
 * @returns {string} - Either '#000000' (black) or '#FFFFFF' (white).
 */
const getContrastingTextColor = (hexColor) => {
  if (!hexColor || hexColor.length < 7) return '#000000';
  try {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
  } catch (e) {
    console.error("Error parsing hex color for contrast:", hexColor, e);
    return '#000000';
  }
};


const RoomCell = ({
  roomName,
  roomColor,         // Expects the COLOR NAME (string) or null/undefined
  displayLetter,     // New prop: The letter to display in the corner (string | null)
  isFixed = false,
  isSelectedInGrid = false,
  isSelectedInModal = false,
  isFinalSelection = false,
  isNoneOption = false,
  isSelectable = true,
  onClick,
  className,
}) => {

  // --- Convert color name to hex value ---
  const hexColorValue = roomColor ? (COLOR_NAME_TO_VALUE[roomColor] || null) : null;
  // --- Determine text color based on the *converted* hex value ---
  const textColor = getContrastingTextColor(hexColorValue);
  // --- Determine background color ---
  const backgroundColor = hexColorValue || '#FFFFFF'; // Default white

  const hasAssignedRoom = !!roomName && !isFixed && !isNoneOption;
  // Show main content if it's a room name, the "None" option, or even just a letter (fallback display)
  const showContent = roomName || isNoneOption;

  // Base classes now include relative positioning for the letter
  const baseClasses = 'w-[70px] h-[70px] relative flex flex-col justify-center items-center border text-center whitespace-break-spaces leading-tight p-[2px] transition-colors duration-200 box-border overflow-hidden'; // Added relative, overflow-hidden

  const cellClasses = clsx(
    baseClasses,
    {
      'border-gray-400': !isFixed && !isNoneOption && !isFinalSelection && !isSelectedInGrid,
      'bg-white': !hexColorValue && !isFixed && !isSelectedInModal && !isNoneOption,
      'cursor-pointer hover:bg-gray-200/70': isSelectable && !isFixed && !isNoneOption,
      'cursor-default': isFixed || !isSelectable,

      // Adjust font size based on content length? Or keep consistent?
      // Using smaller bold text if it's a known room or the fallback letter
      'font-bold text-[9px]': hasAssignedRoom || (!isFixed && !isNoneOption && roomName && roomName.length === 1),
      'text-[10px] font-normal': !hasAssignedRoom && !(roomName && roomName.length === 1) && !isFixed, // Default if not assigned room/letter

      // Fixed Cells
      'bg-slate-300 border-slate-500 font-bold !outline-none !shadow-none': isFixed,
      'hover:bg-slate-300': isFixed,

      // Selection States
      'outline outline-3 outline-blue-600 outline-offset-[-3px] border-blue-600': isSelectedInGrid && !isFixed,
      'bg-gray-200': isSelectedInModal && !isFixed && !isNoneOption, // Modal selection uses background

      // Special Buttons
      'border-dashed border-gray-400 border-[1px] italic text-gray-500 font-normal text-[10px]': isNoneOption,
      'outline outline-3 outline-green-500 outline-offset-[-2px] border-green-500': isFinalSelection,
    },
    className
  );

  // --- Dynamic Styling for Room Color and Text Contrast ---
  const dynamicStyles = {};
  if (hexColorValue && !isFixed && !isSelectedInModal && !isNoneOption) {
    dynamicStyles.backgroundColor = backgroundColor;
  }
  if (!isNoneOption) {
      dynamicStyles.color = isFixed ? '#333333' : textColor;
  }

  // --- Letter Display Styling ---
  // Use contrasting color for the letter, slightly dimmed maybe
  const letterColor = getContrastingTextColor(backgroundColor);
  const letterStyle = {
      color: letterColor,
      opacity: 0.8, // Make it slightly less prominent than main text
  };

  return (
    <div
      className={cellClasses}
      style={dynamicStyles}
      onClick={!isFixed && isSelectable ? onClick : undefined}
      role={isSelectable && !isFixed ? "button" : undefined}
      tabIndex={isSelectable && !isFixed ? 0 : undefined}
      aria-pressed={isSelectedInModal || isSelectedInGrid}
      title={roomName || (isNoneOption ? 'None' : 'Empty Cell')}
    >
      {/* Display Main Content */}
      {showContent ? (isNoneOption ? 'None' : roomName) : ''}

      {/* Display Letter in Top Right Corner if provided */}
      {displayLetter && !isFixed && (
        <span
          className="absolute top-0 right-1 text-[9px] font-bold leading-none"
          style={letterStyle}
          aria-hidden="true" // Hide from screen readers as it's decorative/redundant
        >
          {displayLetter}
        </span>
      )}
    </div>
  );
};

export default RoomCell;
