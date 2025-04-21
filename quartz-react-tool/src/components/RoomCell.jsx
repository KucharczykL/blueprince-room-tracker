// src/components/RoomCell.jsx (or .tsx if using TypeScript)
import React from 'react';
import clsx from 'clsx'; // A handy utility for conditionally joining class names. Install: npm install clsx

/**
 * Determines a contrasting text color (black or white) for a given background hex color.
 * @param {string} hexColor - Background color in hex format (e.g., "#RRGGBB").
 * @returns {string} - Either '#000000' (black) or '#FFFFFF' (white).
 */
const getContrastingTextColor = (hexColor) => {
  if (!hexColor || hexColor.length < 7) return '#000000'; // Default to black for invalid colors

  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  // Calculate luminance (per WCAG standard)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Use white text on dark backgrounds (luminance < 0.5) and black text on light backgrounds
  return luminance < 0.5 ? '#FFFFFF' : '#000000';
};


const RoomCell = ({
  roomName,          // Name of the room (string) or null/undefined
  roomColor,         // Background color hex code (e.g., "#A1C181") or null/undefined
  isFixed = false,   // Is this a non-interactive cell (e.g., stairs, outside)?
  isSelectedInGrid = false, // Is this the currently selected cell in the main mansion grid?
  isSelectedInModal = false,// Is this the selected room in the modal selector?
  isFinalSelection = false, // Is this the confirmed final selection in the modal's chosen offers?
  isNoneOption = false, // Is this the special "None" button in the modal?
  isSelectable = true, // Can this cell be clicked/hovered? (Defaults to true)
  onClick,           // Function to call when clicked
  className,         // Allow passing extra Tailwind classes for specific contexts (e.g., size adjustments)
}) => {

  const hasAssignedRoom = !!roomName && !isFixed && !isNoneOption;
  const showContent = roomName || isNoneOption; // Display text if it's a room or the "None" option

  // Base styles translated from .grid-cell
  const baseClasses = 'w-[70px] h-[70px] flex flex-col justify-center items-center border text-center whitespace-break-spaces leading-tight p-[2px] transition-colors duration-200 box-border';

  // Dynamically apply classes based on props
  const cellClasses = clsx(
    baseClasses,
    {
      // --- Base Appearance & Interactivity ---
      'border-gray-400': !isFixed && !isNoneOption && !isFinalSelection && !isSelectedInGrid, // Default border
      'bg-white': !roomColor && !isFixed && !isSelectedInModal && !isNoneOption, // Default background if no room color/state applies
      'cursor-pointer hover:bg-gray-200': isSelectable && !isFixed && !isNoneOption, // Standard hover effect for selectable cells
      'cursor-default': isFixed || !isSelectable, // Non-clickable cursor

      // --- Text Styling ---
      'font-bold text-[9px]': hasAssignedRoom, // Smaller, bold text when a room is assigned
      'text-[10px] font-normal': !hasAssignedRoom && !isFixed, // Default text size/weight

      // --- Fixed Cells (Main Grid) ---
      // Assuming you add 'blue-gray' to your tailwind.config.js, otherwise use default grays
      // Matches: background-color: #b0bec5; border: 1px solid #78909c; font-weight: bold;
      'bg-blue-gray-200 border-blue-gray-400 font-bold !outline-none !shadow-none': isFixed,
      'hover:bg-blue-gray-200': isFixed, // Prevent hover change on fixed cells

      // --- Selection States ---
      // Matches: outline: 3px solid #0056b3; outline-offset: -3px;
      'outline outline-3 outline-blue-600 outline-offset-[-3px] border-blue-600': isSelectedInGrid && !isFixed, // Main grid selection highlight
      // Matches: background-color: #e0e0e0;
      'bg-gray-200': isSelectedInModal && !isFixed && !isNoneOption, // Modal selection highlight (background change)

      // --- Modal Specific Buttons ---
      // Matches: border-style: dashed !important; border-color: #aaa !important; border-width: 1px !important; font-style: italic; color: #666 !important;
      'border-dashed border-gray-400 border-[1px] italic text-gray-500 font-normal text-[10px]': isNoneOption, // "None" button style
      // Matches: outline: 3px solid #28a745; outline-offset: -2px; border-color: #28a745 !important;
      'outline outline-3 outline-green-500 outline-offset-[-2px] border-green-500': isFinalSelection, // Final chosen offer highlight
    },
    className // Apply any custom classes passed via props
  );

  // --- Dynamic Styling for Room Color and Text Contrast ---
  const dynamicStyles = {};
  let textColor = '#000000'; // Default text color

  if (roomColor && !isFixed && !isNoneOption) {
    dynamicStyles.backgroundColor = roomColor;
    // Ensure text is readable against the room color
    textColor = getContrastingTextColor(roomColor);
  } else if (isFixed) {
    // Ensure fixed cells use a specific text color if needed (e.g., dark text on light gray)
    textColor = '#333333'; // Example: Dark gray text for fixed cells
  } else if (isNoneOption) {
    textColor = '#666666'; // Specific color for "None" text
  }
  // Apply text color unless overridden by a state (like isNoneOption handled via class)
  if (!isNoneOption) {
      dynamicStyles.color = textColor;
  }


  return (
    <div
      className={cellClasses}
      style={dynamicStyles} // Apply background and text color
      onClick={!isFixed && isSelectable ? onClick : undefined}
      role={isSelectable && !isFixed ? "button" : undefined}
      tabIndex={isSelectable && !isFixed ? 0 : undefined}
      aria-pressed={isSelectedInModal || isSelectedInGrid} // Indicate selection state for accessibility
      title={roomName || (isNoneOption ? 'None' : 'Empty Cell')} // Tooltip for clarity
    >
      {/* Display content only if it's a room, fixed cell, or the None option */}
      {showContent ? (isNoneOption ? 'None' : roomName) : ''}
    </div>
  );
};

export default RoomCell;
