import { formatInTimeZone } from 'date-fns-tz';
import { addHours } from 'date-fns';

// 你自己的型別
import { Country, TimeZoneOption, TimeZoneRange } from '../types/index';
import countriesData from '../data/countries.json';

/**
 * 1) 獲取瀏覽器時區
 */
export const getBrowserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * 2) 獲取時區選項列表
 */
export const getTimeZoneOptions = (): TimeZoneOption[] => {
  const uniqueTimeZones = new Set<string>();
  
  // 可以在此添加一些「常用時區」(範例：已新增 'Asia/Taipei')
  const commonTimeZones = [
    'Asia/Taipei',            
    'Africa/Johannesburg', 
    'America/New_York', 
    'America/Chicago', 
    'America/Denver', 
    'America/Los_Angeles', 
    'America/Anchorage', 
    'Pacific/Honolulu', 
    'Europe/London', 
    'Europe/Berlin', 
    'Europe/Paris', 
    'Europe/Moscow', 
    'Asia/Tokyo', 
    'Asia/Shanghai', 
    'Asia/Kolkata', 
    'Asia/Singapore', 
    'Asia/Seoul', 
    'Australia/Sydney', 
    'Pacific/Auckland'
  ];
  
  commonTimeZones.forEach(tz => uniqueTimeZones.add(tz));
  
  // 從 countriesData 裡所有國家的時區也加進 set
  (countriesData as Country[]).forEach(country => {
    if (country.timezones && Array.isArray(country.timezones)) {
      country.timezones.forEach(tz => uniqueTimeZones.add(tz));
    }
  });
  
  // 轉成陣列並排序
  const timeZones = Array.from(uniqueTimeZones).sort();
  
  return timeZones.map((tz: string) => {
    const tzOffset = getTimezoneOffset(tz);
    const offsetHours = Math.floor(Math.abs(tzOffset));
    const offsetMinutes = Math.round((Math.abs(tzOffset) % 1) * 60);
    const offsetStr = tzOffset >= 0 
      ? `+${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}` 
      : `-${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return {
      value: tz,
      label: tz,
      offset: `UTC${offsetStr}`,
      offsetValue: tzOffset
    };
  });
};

/**
 * 3) 取得指定時區的偏移量（以小時為單位）
 */
export const getTimezoneOffset = (timeZone: string): number => {
  try {
    const date = new Date();
    // 用 ISO 格式輸出
    const tzTime = formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ss");
    const utcTime = formatInTimeZone(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ss");

    const tzDate = new Date(tzTime);
    const utcDate = new Date(utcTime);

    // 若解析失敗 -> tzDate 或 utcDate 可能是 Invalid Date
    if (isNaN(tzDate.getTime()) || isNaN(utcDate.getTime())) {
      console.warn(`getTimezoneOffset: Cannot parse timeZone "${timeZone}" on this environment.`);
      return 0; // fallback
    }

    // 計算時差 (小時)
    const offset = (tzDate.getTime() - utcDate.getTime()) / 1000 / 60 / 60;
    // 不做四捨五入，以避免 30 分鐘或 45 分鐘時區失準
    return offset;
  } catch (err) {
    console.error(`getTimezoneOffset error for ${timeZone}:`, err);
    return 0; // fallback
  }
};

/**
 * 4) 取得國家的所有時區（含偏移）
 */
export const getCountryTimeZones = (countryCode: string): TimeZoneOption[] => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  if (!country || !country.timezones || country.timezones.length === 0) {
    return [];
  }
  
  return country.timezones.map(tz => {
    const tzOffset = getTimezoneOffset(tz);
    const offsetHours = Math.floor(Math.abs(tzOffset));
    const offsetMinutes = Math.round((Math.abs(tzOffset) % 1) * 60);
    const offsetStr = tzOffset >= 0 
      ? `+${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}` 
      : `-${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return {
      value: tz,
      label: tz,
      offset: `UTC${offsetStr}`,
      offsetValue: tzOffset
    };
  });
};

/**
 * 5) 計算指定國家與使用者時區的時差 (小時)
 */
export const calculateTimeDifference = (countryCode: string, userTimeZone: string): number => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  if (!country || !country.timezones || country.timezones.length === 0) {
    return 0;
  }
  // 使用國家的第一個時區（或主要時區）
  const countryTimeZone = country.timezones[0];
  return calculateTimeZoneDifference(countryTimeZone, userTimeZone);
};

/**
 * 6) 計算兩個時區之間的時差 (小時)
 */
export const calculateTimeZoneDifference = (timezone1: string, timezone2: string): number => {
  const offset1 = getTimezoneOffset(timezone1);
  const offset2 = getTimezoneOffset(timezone2);
  
  let hourDiff = offset1 - offset2;

  // 可選：確保時差在 -12 到 +12 之間
  if (hourDiff > 12) hourDiff -= 24;
  if (hourDiff < -12) hourDiff += 24;
  
  return hourDiff;
};

/**
 * 7) 判斷國家是否在指定的時區範圍內
 */
export const isCountryInTimeZoneRange = (
  countryCode: string, 
  userTimeZone: string, 
  workTime: string, 
  wakeTime: string
): boolean => {
  const timeDiff = calculateTimeDifference(countryCode, userTimeZone);
  const workHour = parseInt(workTime.split(':')[0]);
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  
  const countryLocalHour = (workHour + timeDiff + 24) % 24;
  return countryLocalHour >= wakeHour;
};

/**
 * 8) 判斷國家是否在指定的時差範圍內
 */
export const isCountryInOffsetRange = (
  countryCode: string,
  userTimeZone: string,
  range: TimeZoneRange
): boolean => {
  const timeDiff = calculateTimeDifference(countryCode, userTimeZone);
  return timeDiff >= range.minOffset && timeDiff <= range.maxOffset;
};

/**
 * 9) 根據時差範圍篩選國家
 */
export const filterCountriesByTimeZoneRange = (
  userTimeZone: string,
  range: TimeZoneRange
): Country[] => {
  return (countriesData as Country[]).filter(country => 
    isCountryInOffsetRange(country.code, userTimeZone, range)
  );
};

/**
 * 10) 取得國家中心點（經緯度）
 */
export const getCountryCentroid = (countryCode: string): [number, number] => {
  const country = (countriesData as Country[]).find(c => c.code === countryCode);
  return country ? country.latlng : [0, 0];
};

/**
 * 11) 格式化時間 (以 12 小時制顯示: "hh:mm a")
 */
export const formatTime = (time: Date, timeZone: string): string => {
  // 若傳入的是無效的 Date
  if (isNaN(time.getTime())) {
    return '--:--';
  }
  try {
    return formatInTimeZone(time, timeZone, 'hh:mm a');
  } catch (err) {
    console.error(`formatTime error for ${timeZone}:`, err);
    return '--:--';
  }
};

/**
 * 12) 取得指定時區的當前時間 (Date 物件)
 */
export const getCurrentTimeInTimeZone = (timeZone: string): Date => {
  const now = new Date();
  const offset = getTimezoneOffset(timeZone);
  // 若 offset 無法解析（NaN）則當作 0
  if (isNaN(offset)) return now;
  return addHours(now, offset);
};
