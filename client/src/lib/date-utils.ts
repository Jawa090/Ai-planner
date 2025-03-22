import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isTomorrow, isThisWeek, formatDistance } from "date-fns";

export const formatDate = (date: Date | null): string => {
  if (!date) return "";
  return format(date, "EEEE, MMMM d");
};

export const formatTime = (date: Date | null): string => {
  if (!date) return "";
  return format(date, "h:mm a");
};

export const formatTimeRange = (startTime: Date | null, endTime: Date | null): string => {
  if (!startTime || !endTime) return "";
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getRelativeDateDescription = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date)) return format(date, "EEEE");
  return format(date, "MMM d");
};

export const getPreviousDay = (date: Date): Date => {
  return subDays(date, 1);
};

export const getNextDay = (date: Date): Date => {
  return addDays(date, 1);
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const getTimeFromDate = (date: Date | null): string => {
  if (!date) return "";
  return format(date, "HH:mm");
};

export const getTimeSlots = (): string[] => {
  const slots = [];
  for (let i = 8; i <= 18; i++) {
    slots.push(`${i}:00`);
    slots.push(`${i}:30`);
  }
  return slots;
};
