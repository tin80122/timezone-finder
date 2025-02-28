import { useState, useEffect } from 'react';
import { 
  getBrowserTimeZone, 
  getTimeZoneOptions, 
  isCountryInTimeZoneRange,
  filterCountriesByTimeZoneRange
} from '../utils/timezoneUtils';
import { Country, TimeZoneRange } from '../types/index';
import countriesData from '../data/countries.json';

export const useTimezones = () => {
  const [userTimeZone, setUserTimeZone] = useState<string>(getBrowserTimeZone());
  const [workTime, setWorkTime] = useState<string>('09:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [timeZoneOptions] = useState(getTimeZoneOptions());
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [useTimeRange, setUseTimeRange] = useState<boolean>(false);
  const [timeZoneRange, setTimeZoneRange] = useState<TimeZoneRange>({
    minOffset: -3,
    maxOffset: 3
  });
  
  useEffect(() => {
    let filtered: Country[];
    
    if (useTimeRange) {
      // 使用時差範圍篩選
      filtered = filterCountriesByTimeZoneRange(userTimeZone, timeZoneRange);
    } else {
      // 使用上班/起床時間篩選
      filtered = (countriesData as Country[]).filter(country => 
        isCountryInTimeZoneRange(country.code, userTimeZone, workTime, wakeTime)
      );
    }
    
    setFilteredCountries(filtered);
  }, [userTimeZone, workTime, wakeTime, useTimeRange, timeZoneRange]);
  
  return {
    userTimeZone,
    setUserTimeZone,
    workTime,
    setWorkTime,
    wakeTime,
    setWakeTime,
    timeZoneOptions,
    filteredCountries,
    allCountries: countriesData as Country[],
    useTimeRange,
    setUseTimeRange,
    timeZoneRange,
    setTimeZoneRange
  };
};
