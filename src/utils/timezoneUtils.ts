import { Country, TimeZoneOption, TimeZoneRange } from '../types/index';
import countriesData from '../data/countries.json';
import { formatInTimeZone } from 'date-fns-tz';
import { addHours } from 'date-fns';

// 獲取瀏覽器時區
export const getBrowserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// 獲取時區選項列表
export const getTimeZoneOptions = (): TimeZoneOption[] => {
  // 從國家數據中收集所有唯一的時區
  const uniqueTimeZones = new Set<string>();
  
  // 添加一些常用的時區
  const commonTimeZones = [
    'Africa/Johannesburg', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 
    'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow', 'Asia/Tokyo', 'Asia/Shanghai', 
    'Asia/Kolkata', 'Asia/Singapore', 'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  // 添加常用時區
  commonTimeZones.forEach(tz => uniqueTimeZones.add(tz));
  
  // 從國家數據中添加時區
  (countriesData as Country[]).forEach(country => {
    if (country.timezones && Array.isArray(country.timezones)) {
      country.timezones.forEach(tz => uniqueTimeZones.add(tz));
    }
  });
  
  // 轉換為數組並排序
  const timeZones = Array.from(uniqueTimeZones).sort();
  
  return timeZones.map((tz: string) => {
    const tzOffset = getTimezoneOffset(tz);
    const offsetHours = Math.abs(Math.floor(tzOffset));
    const offsetMinutes = Math.abs(Math.round((tzOffset % 1) * 60));
    const offsetStr = tzOffset >= 0 
      ? `+${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}` 
      : `-${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return {
      value: tz,
      label: `${tz}`,
      offset: `UTC${offsetStr}`,
      offsetValue: tzOffset
    };
  });
};

// 獲取時區的偏移量（小時）
export const getTimezoneOffset = (timeZone: string): number => {
  const date = new Date();
  // 獲取當前時區的時間字符串
  const tzTime = formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss');
  // 獲取UTC時間字符串
  const utcTime = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd HH:mm:ss');
  
  // 解析為Date對象
  const tzDate = new Date(tzTime);
  const utcDate = new Date(utcTime);
  
  // 計算時差（小時）
  const offset = (tzDate.getTime() - utcDate.getTime()) / 1000 / 60 / 60;
  return Math.round(offset);
};

// 獲取國家的所有時區及其偏移量
export const getCountryTimeZones = (countryCode: string): TimeZoneOption[] => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  if (!country || !country.timezones || country.timezones.length === 0) {
    return [];
  }
  
  return country.timezones.map(tz => {
    const tzOffset = getTimezoneOffset(tz);
    const offsetHours = Math.abs(Math.floor(tzOffset));
    const offsetMinutes = Math.abs(Math.round((tzOffset % 1) * 60));
    const offsetStr = tzOffset >= 0 
      ? `+${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}` 
      : `-${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return {
      value: tz,
      label: `${tz}`,
      offset: `UTC${offsetStr}`,
      offsetValue: tzOffset
    };
  });
};

// 計算時差 (使用主要時區，通常是首都所在時區)
export const calculateTimeDifference = (countryCode: string, userTimeZone: string): number => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  if (!country || !country.timezones || country.timezones.length === 0) {
    return 0;
  }
  
  // 使用國家的主要時區（通常是首都所在時區）
  const countryTimeZone = country.timezones[0];
  
  return calculateTimeZoneDifference(countryTimeZone, userTimeZone);
};

// 計算兩個時區之間的時差
export const calculateTimeZoneDifference = (timezone1: string, timezone2: string): number => {
  // 計算時區的偏移量
  const offset1 = getTimezoneOffset(timezone1);
  const offset2 = getTimezoneOffset(timezone2);
  
  // 計算時差
  let hourDiff = offset1 - offset2;
  
  // 確保時差在 -12 到 12 之間
  if (hourDiff > 12) hourDiff -= 24;
  if (hourDiff < -12) hourDiff += 24;
  
  return hourDiff;
};

// 判斷國家是否在指定的時區範圍內
export const isCountryInTimeZoneRange = (
  countryCode: string, 
  userTimeZone: string, 
  workTime: string, 
  wakeTime: string
): boolean => {
  // 計算時差
  const timeDiff = calculateTimeDifference(countryCode, userTimeZone);
  
  // 獲取用戶設置的上班時間（小時）
  const workHour = parseInt(workTime.split(':')[0]);
  
  // 獲取用戶設置的最早起床時間（小時）
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  
  // 計算當用戶所在地區是上班時間時，該國家的本地時間
  const countryLocalHour = (workHour + timeDiff + 24) % 24;
  
  // 如果該國家的本地時間大於或等於用戶設定的最早起床時間，則該國家符合條件
  return countryLocalHour >= wakeHour;
};

// 判斷國家是否在指定的時差範圍內
export const isCountryInOffsetRange = (
  countryCode: string,
  userTimeZone: string,
  range: TimeZoneRange
): boolean => {
  const timeDiff = calculateTimeDifference(countryCode, userTimeZone);
  return timeDiff >= range.minOffset && timeDiff <= range.maxOffset;
};

// 根據時差範圍篩選國家
export const filterCountriesByTimeZoneRange = (
  userTimeZone: string,
  range: TimeZoneRange
): Country[] => {
  return (countriesData as Country[]).filter(country => 
    isCountryInOffsetRange(country.code, userTimeZone, range)
  );
};

// 獲取國家中心點
export const getCountryCentroid = (countryCode: string): [number, number] => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  return country ? country.latlng : [0, 0];
};

// 格式化時間
export const formatTime = (time: Date, timeZone: string): string => {
  return formatInTimeZone(time, timeZone, 'hh:mm a');
};

// 獲取指定時區的當前時間
export const getCurrentTimeInTimeZone = (timeZone: string): Date => {
  const now = new Date();
  const offset = getTimezoneOffset(timeZone);
  return addHours(now, offset);
};
