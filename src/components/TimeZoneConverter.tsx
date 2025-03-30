import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Divider, 
  Chip, IconButton, SelectChangeEvent, useTheme, alpha, Card, CardHeader, CardContent, 
  ListSubheader, InputBase 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PublicIcon from '@mui/icons-material/Public';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import dayjs from 'dayjs';
// 你自己定義的型別
import { TimeZoneOption, Country } from '../types/index';

// 從工具函式匯入
import { 
  getTimeZoneOptions, 
  calculateTimeZoneDifference, 
  formatTime 
} from '../utils/timezoneUtils';

/**
 * Props
 */
interface TimeZoneConverterProps {
  userTimeZone: string;   // 來源預設時區
  countries: Country[];   // 國家資料
  workTime: string;       // 預設上班時間 (HH:mm)
}

/**
 * 輔助函數：將 "HH:mm" 格式的時間加上 9 小時（假設上班 9 小時後下班）
 */
const addHoursToTime = (timeStr: string) => {
  // 若傳入空字串或格式不符，預設回傳 "18:00"
  if (!timeStr) return '18:00';

  const [hh, mm] = timeStr.split(':');
  if (!hh || !mm) {
    console.warn(`Invalid workTime input: ${timeStr}`);
    return '18:00';
  }

  // 使用當前時間作為基底，但覆蓋小時與分鐘
  const base = dayjs().hour(parseInt(hh, 10)).minute(parseInt(mm, 10)).second(0).millisecond(0);
  if (!base.isValid()) {
    console.warn(`Invalid workTime input: ${timeStr}`);
    return '18:00';
  }
  
  // 加上9小時後格式化為 "HH:mm"
  return base.add(9, 'hour').format('HH:mm');
};


export const TimeZoneConverter: React.FC<TimeZoneConverterProps> = ({ userTimeZone, countries, workTime }) => {
  const theme = useTheme();

  // 狀態
  const [fromTimeZone, setFromTimeZone] = useState(userTimeZone || 'UTC');  // 避免傳入空字串
  const [toTimeZone, setToTimeZone] = useState('');                         // 目標時區
  const [time, setTime] = useState('');                                     // 一般時間 (HH:mm)
  const [workStartTime, setWorkStartTime] = useState(workTime || '09:00');  // 預設上班時間
  const [workEndTime, setWorkEndTime] = useState(addHoursToTime(workTime)); // 預設下班時間
  const [convertedTime, setConvertedTime] = useState<Date | null>(null);
  const [convertedWorkStartTime, setConvertedWorkStartTime] = useState<Date | null>(null);
  const [convertedWorkEndTime, setConvertedWorkEndTime] = useState<Date | null>(null);
  const [timeDifference, setTimeDifference] = useState(0);
  const [timeZoneOptions, setTimeZoneOptions] = useState<TimeZoneOption[]>([]);
  const [countryTimeZones, setCountryTimeZones] = useState<{[key: string]: TimeZoneOption[]}>({});
  const [fromSearchTerm, setFromSearchTerm] = useState('');
  const [toSearchTerm, setToSearchTerm] = useState('');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  /**
   * 1) 讀取本地收藏時區
   */
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTimezones');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorite timezones', error);
      }
    }
  }, []);

  /**
   * 2) 儲存本地收藏時區
   */
  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem('favoriteTimezones', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  /**
   * 3) 切換收藏狀態
   */
  const toggleFavorite = (tzValue: string) => {
    if (favorites.includes(tzValue)) {
      saveFavorites(favorites.filter(fav => fav !== tzValue));
    } else {
      saveFavorites([...favorites, tzValue]);
    }
  };

  /**
   * 4) 初始化
   */
  useEffect(() => {
    // 預設時間：當前時間
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    setTime(`${hh}:${mm}`);
    
    // 取得所有可用時區
    const options = getTimeZoneOptions();
    setTimeZoneOptions(options);
    
    // 給目標時區一個預設值
    const defaultToTimeZone = 'America/New_York';
    setToTimeZone(defaultToTimeZone);
    
    // 依國家整理出該國家可用的時區列表
    const tzByCountry: {[key: string]: TimeZoneOption[]} = {};
    countries.forEach(country => {
      if (country.timezones && country.timezones.length > 0) {
        const countryTzOptions = country.timezones.map(tz => {
          const option = options.find(opt => opt.value === tz);
          return option || { value: tz, label: tz, offset: 'UTC+00:00', offsetValue: 0 };
        });
        tzByCountry[country.name] = countryTzOptions;
      }
    });
    setCountryTimeZones(tzByCountry);
  }, [countries]);

  /**
   * 5) userTimeZone 變更時，同步更新 fromTimeZone
   */
  useEffect(() => {
    if (userTimeZone) {
      setFromTimeZone(userTimeZone);
    }
  }, [userTimeZone]);

  /**
   * 6) workTime 變更時，更新上下班時間
   */
  useEffect(() => {
    if (workTime) {
      setWorkStartTime(workTime);
      setWorkEndTime(addHoursToTime(workTime));
    }
  }, [workTime]);

  /**
   * 7) 當來源或目標時區 / 時間改變時，計算轉換後的時間
   */
  useEffect(() => {
    if (!fromTimeZone || !toTimeZone) return;

    const diff = calculateTimeZoneDifference(toTimeZone, fromTimeZone);
    setTimeDifference(diff);

    // 轉換「一般時間」
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        const convertedDate = new Date(date.getTime() + diff * 3600 * 1000);
        setConvertedTime(convertedDate);
      } else {
        setConvertedTime(null);
      }
    } else {
      setConvertedTime(null);
    }

    // 轉換「上班時間」
    if (workStartTime) {
      const [startHours, startMinutes] = workStartTime.split(':').map(Number);
      if (!isNaN(startHours) && !isNaN(startMinutes)) {
        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);
        const convertedStartDate = new Date(startDate.getTime() + diff * 3600 * 1000);
        setConvertedWorkStartTime(convertedStartDate);
      } else {
        setConvertedWorkStartTime(null);
      }
    } else {
      setConvertedWorkStartTime(null);
    }

    // 轉換「下班時間」
    if (workEndTime) {
      const [endHours, endMinutes] = workEndTime.split(':').map(Number);
      if (!isNaN(endHours) && !isNaN(endMinutes)) {
        const endDate = new Date();
        endDate.setHours(endHours, endMinutes, 0, 0);
        const convertedEndDate = new Date(endDate.getTime() + diff * 3600 * 1000);
        setConvertedWorkEndTime(convertedEndDate);
      } else {
        setConvertedWorkEndTime(null);
      }
    } else {
      setConvertedWorkEndTime(null);
    }
  }, [fromTimeZone, toTimeZone, time, workStartTime, workEndTime]);

  /**
   * handler：改變「一般時間」
   */
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  /**
   * handler：改變「上班時間」
   */
  const handleWorkStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setWorkStartTime(newVal);
    setWorkEndTime(addHoursToTime(newVal)); // 同時自動更新下班時間
  };

  /**
   * handler：改變「下班時間」
   */
  const handleWorkEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkEndTime(event.target.value);
  };

  /**
   * handler：來源時區選擇
   */
  const handleFromTimeZoneChange = (event: SelectChangeEvent) => {
    setFromTimeZone(event.target.value);
    setFromSearchTerm('');
  };

  /**
   * handler：目標時區選擇
   */
  const handleToTimeZoneChange = (event: SelectChangeEvent) => {
    setToTimeZone(event.target.value);
    setToSearchTerm('');
  };

  /**
   * handler：來源時區搜索
   */
  const handleFromSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFromSearchTerm(event.target.value);
  };

  /**
   * handler：目標時區搜索
   */
  const handleToSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToSearchTerm(event.target.value);
  };

  /**
   * handler：清除來源時區搜索
   */
  const handleClearFromSearch = () => {
    setFromSearchTerm('');
  };

  /**
   * handler：清除目標時區搜索
   */
  const handleClearToSearch = () => {
    setToSearchTerm('');
  };

  /**
   * handler：交換來源與目標時區
   */
  const handleSwapTimeZones = () => {
    const temp = fromTimeZone;
    setFromTimeZone(toTimeZone);
    setToTimeZone(temp);
  };

  /**
   * 取得時差顯示
   */
  const getTimeDifferenceDisplay = (): string => {
    if (timeDifference === 0) return '相同時區';
    const sign = timeDifference > 0 ? '+' : '';
    return `${sign}${timeDifference} 小時`;
  };

  /**
   * 取得時差對應的顏色
   */
  const getTimeDiffColor = (diff: number): string => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 2) return theme.palette.success.main;
    if (absDiff <= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  /**
   * 找出使用該時區的國家
   */
  const findCountriesWithTimeZone = (tz: string): string[] => {
    return Object.keys(countryTimeZones).filter(country => 
      countryTimeZones[country].some(option => option.value === tz)
    );
  };

  /**
   * 過濾時區選項
   */
  const filterTimeZoneOptions = (options: TimeZoneOption[], searchTerm: string): TimeZoneOption[] => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      option.offset.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * 分組時區選項 (例如 "Asia/Taipei" -> "Asia")
   */
  const groupTimeZoneOptions = (options: TimeZoneOption[]): Record<string, TimeZoneOption[]> => {
    const grouped: Record<string, TimeZoneOption[]> = {};
    options.forEach(option => {
      const region = option.label.split('/')[0];
      if (!grouped[region]) grouped[region] = [];
      grouped[region].push(option);
    });
    return grouped;
  };

  /**
   * 取得該時區的當前時間（僅顯示 HH:mm）
   */
  const getCurrentTimeInTimezone = (offsetStr: string) => {
    try {
      const now = new Date();
      // offsetStr 例如 "UTC+08:00" -> 解析成 +8.00
      const offsetHours = parseFloat(offsetStr.replace('UTC', '').replace(':', '.'));
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const tzTime = new Date(utc + (3600000 * offsetHours));
      if (isNaN(tzTime.getTime())) return '--:--';
      return tzTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (error) {
      console.error('Error calculating timezone time:', error);
      return '--:--';
    }
  };

  // 過濾後的選項、分組、收藏
  const filteredFromOptions = filterTimeZoneOptions(timeZoneOptions, fromSearchTerm);
  const filteredToOptions = filterTimeZoneOptions(timeZoneOptions, toSearchTerm);
  const favoriteFromOptions = filteredFromOptions.filter(option => favorites.includes(option.value));
  const favoriteToOptions = filteredToOptions.filter(option => favorites.includes(option.value));
  const groupedFromOptions = groupTimeZoneOptions(filteredFromOptions);
  const groupedToOptions = groupTimeZoneOptions(filteredToOptions);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', mt: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">時區轉換工具</Typography>
          </Box>
        }
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.05), 
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* 左半部：來源時區與時間設定 */}
          <Grid item xs={12} sm={5}>
            {/* 來源時區 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PublicIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2">來源時區</Typography>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel id="from-timezone-label">選擇來源時區</InputLabel>
                <Select
                  labelId="from-timezone-label"
                  value={fromTimeZone}
                  label="選擇來源時區"
                  onChange={handleFromTimeZoneChange}
                  open={fromOpen}
                  onOpen={() => setFromOpen(true)}
                  onClose={() => { setFromOpen(false); setFromSearchTerm(''); }}
                  MenuProps={{ 
                    PaperProps: { style: { maxHeight: 400 } }, 
                    MenuListProps: { style: { padding: 0 } } 
                  }}
                >
                  {/* 搜索框 */}
                  <Box 
                    component="li" 
                    sx={{ 
                      position: 'sticky', 
                      top: 0, 
                      backgroundColor: 'white', 
                      zIndex: 1, 
                      p: 1, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider' 
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1, 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 1 
                      }}
                    >
                      <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                      <InputBase 
                        placeholder="搜索時區..." 
                        value={fromSearchTerm} 
                        onChange={handleFromSearchChange} 
                        fullWidth 
                        sx={{ fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()} 
                      />
                      {fromSearchTerm && (
                        <IconButton size="small" onClick={handleClearFromSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* 收藏的時區（若有） */}
                  {favoriteFromOptions.length > 0 && [
                    <ListSubheader 
                      key="favorites" 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1), 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <FavoriteIcon 
                        fontSize="small" 
                        sx={{ mr: 1, color: theme.palette.primary.main }} 
                      /> 
                      收藏的時區
                    </ListSubheader>,
                    ...favoriteFromOptions.map(option => (
                      <MenuItem key={`fav-${option.value}`} value={option.value}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            width: '100%', 
                            alignItems: 'center' 
                          }}
                        >
                          <Typography>{option.label}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ mr: 1 }}
                            >
                              {option.offset}
                            </Typography>
                            <Chip 
                              label={getCurrentTimeInTimezone(option.offset)} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                '& .MuiChip-label': { px: 1, py: 0 } 
                              }} 
                            />
                          </Box>
                        </Box>
                      </MenuItem>
                    )),
                    <Divider key="fav-divider" />
                  ]}

                  {/* 分組顯示時區 */}
                  {Object.keys(groupedFromOptions).length > 0 ? (
                    Object.keys(groupedFromOptions).sort().map(region => [
                      <ListSubheader 
                        key={region} 
                        sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                      >
                        {region}
                      </ListSubheader>,
                      ...groupedFromOptions[region]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                width: '100%', 
                                alignItems: 'center', 
                                '&:hover .favorite-icon': { opacity: 1 } 
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={e => { 
                                    e.stopPropagation(); 
                                    toggleFavorite(option.value); 
                                  }} 
                                  className="favorite-icon" 
                                  sx={{ 
                                    mr: 1, 
                                    opacity: favorites.includes(option.value) ? 1 : 0, 
                                    transition: 'opacity 0.2s' 
                                  }} 
                                  color={favorites.includes(option.value) ? 'primary' : 'default'}
                                >
                                  {favorites.includes(option.value) 
                                    ? <FavoriteIcon fontSize="small" /> 
                                    : <FavoriteBorderIcon fontSize="small" />
                                  }
                                </IconButton>
                                <Typography>{option.label}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ mr: 1 }}
                                >
                                  {option.offset}
                                </Typography>
                                <Chip 
                                  label={getCurrentTimeInTimezone(option.offset)} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { px: 1, py: 0 } 
                                  }} 
                                />
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                    ]).flat()
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        {fromSearchTerm ? '沒有符合搜索條件的時區' : '沒有可用的時區'}
                      </Typography>
                    </Box>
                  )}
                </Select>
              </FormControl>
              {fromTimeZone && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    使用此時區的國家：
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {findCountriesWithTimeZone(fromTimeZone).slice(0, 3).map((country, index) => (
                      <Chip 
                        key={index} 
                        label={country} 
                        size="small" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    ))}
                    {findCountriesWithTimeZone(fromTimeZone).length > 3 && (
                      <Chip 
                        label={`+${findCountriesWithTimeZone(fromTimeZone).length - 3} 個國家`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* 來源時間設定 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2">時間</Typography>
              </Box>
              <TextField 
                fullWidth 
                type="time" 
                value={time} 
                onChange={handleTimeChange} 
                size="small" 
                InputLabelProps={{ shrink: true }} 
              />
            </Box>

            {/* 上班時間 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2">上班時間</Typography>
              </Box>
              <TextField 
                fullWidth 
                type="time" 
                value={workStartTime} 
                onChange={handleWorkStartTimeChange} 
                size="small" 
                InputLabelProps={{ shrink: true }} 
              />
            </Box>

            {/* 下班時間 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2">下班時間</Typography>
              </Box>
              <TextField 
                fullWidth 
                type="time" 
                value={workEndTime} 
                onChange={handleWorkEndTimeChange} 
                size="small" 
                InputLabelProps={{ shrink: true }} 
              />
            </Box>
          </Grid>

          {/* 中間：交換時區 */}
          <Grid 
            item 
            xs={12} 
            sm={2} 
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mt: { xs: 0, sm: 2 } 
              }}
            >
              <IconButton 
                onClick={handleSwapTimeZones} 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1), 
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) } 
                }}
              >
                <SwapHorizIcon />
              </IconButton>
              <Box 
                sx={{ 
                  mt: 1, 
                  p: 0.5, 
                  borderRadius: 1, 
                  backgroundColor: alpha(getTimeDiffColor(timeDifference), 0.1), 
                  border: `1px solid ${alpha(getTimeDiffColor(timeDifference), 0.3)}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'medium', 
                    color: getTimeDiffColor(timeDifference) 
                  }}
                >
                  {getTimeDifferenceDisplay()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 右半部：目標時區與轉換結果 */}
          <Grid item xs={12} sm={5}>
            {/* 目標時區 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PublicIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2">目標時區</Typography>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel id="to-timezone-label">選擇目標時區</InputLabel>
                <Select
                  labelId="to-timezone-label"
                  value={toTimeZone}
                  label="選擇目標時區"
                  onChange={handleToTimeZoneChange}
                  open={toOpen}
                  onOpen={() => setToOpen(true)}
                  onClose={() => { setToOpen(false); setToSearchTerm(''); }}
                  MenuProps={{ 
                    PaperProps: { style: { maxHeight: 400 } }, 
                    MenuListProps: { style: { padding: 0 } } 
                  }}
                >
                  {/* 搜索框 */}
                  <Box 
                    component="li" 
                    sx={{ 
                      position: 'sticky', 
                      top: 0, 
                      backgroundColor: 'white', 
                      zIndex: 1, 
                      p: 1, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider' 
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1, 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 1 
                      }}
                    >
                      <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                      <InputBase 
                        placeholder="搜索時區..." 
                        value={toSearchTerm} 
                        onChange={handleToSearchChange} 
                        fullWidth 
                        sx={{ fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()} 
                      />
                      {toSearchTerm && (
                        <IconButton size="small" onClick={handleClearToSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* 收藏的時區（若有） */}
                  {favoriteToOptions.length > 0 && [
                    <ListSubheader 
                      key="favorites" 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1), 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <FavoriteIcon 
                        fontSize="small" 
                        sx={{ mr: 1, color: theme.palette.primary.main }} 
                      /> 
                      收藏的時區
                    </ListSubheader>,
                    ...favoriteToOptions.map(option => (
                      <MenuItem key={`fav-${option.value}`} value={option.value}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            width: '100%', 
                            alignItems: 'center' 
                          }}
                        >
                          <Typography>{option.label}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ mr: 1 }}
                            >
                              {option.offset}
                            </Typography>
                            <Chip 
                              label={getCurrentTimeInTimezone(option.offset)} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                '& .MuiChip-label': { px: 1, py: 0 } 
                              }} 
                            />
                          </Box>
                        </Box>
                      </MenuItem>
                    )),
                    <Divider key="fav-divider" />
                  ]}

                  {/* 分組顯示時區 */}
                  {Object.keys(groupedToOptions).length > 0 ? (
                    Object.keys(groupedToOptions).sort().map(region => [
                      <ListSubheader 
                        key={region} 
                        sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                      >
                        {region}
                      </ListSubheader>,
                      ...groupedToOptions[region]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                width: '100%', 
                                alignItems: 'center', 
                                '&:hover .favorite-icon': { opacity: 1 } 
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={e => { 
                                    e.stopPropagation(); 
                                    toggleFavorite(option.value); 
                                  }} 
                                  className="favorite-icon" 
                                  sx={{ 
                                    mr: 1, 
                                    opacity: favorites.includes(option.value) ? 1 : 0, 
                                    transition: 'opacity 0.2s' 
                                  }} 
                                  color={favorites.includes(option.value) ? 'primary' : 'default'}
                                >
                                  {favorites.includes(option.value) 
                                    ? <FavoriteIcon fontSize="small" /> 
                                    : <FavoriteBorderIcon fontSize="small" />
                                  }
                                </IconButton>
                                <Typography>{option.label}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ mr: 1 }}
                                >
                                  {option.offset}
                                </Typography>
                                <Chip 
                                  label={getCurrentTimeInTimezone(option.offset)} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { px: 1, py: 0 } 
                                  }} 
                                />
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                    ]).flat()
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        {toSearchTerm ? '沒有符合搜索條件的時區' : '沒有可用的時區'}
                      </Typography>
                    </Box>
                  )}
                </Select>
              </FormControl>
              {toTimeZone && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    使用此時區的國家：
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {findCountriesWithTimeZone(toTimeZone).slice(0, 3).map((country, index) => (
                      <Chip 
                        key={index} 
                        label={country} 
                        size="small" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    ))}
                    {findCountriesWithTimeZone(toTimeZone).length > 3 && (
                      <Chip 
                        label={`+${findCountriesWithTimeZone(toTimeZone).length - 3} 個國家`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }} 
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* 轉換後的結果 */}
            <Box 
              sx={{ 
                mt: 4, 
                p: 2, 
                backgroundColor: alpha(theme.palette.info.main, 0.05), 
                borderRadius: 1 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="subtitle2" color="info.main">
                  轉換後的時間
                </Typography>
              </Box>
              {convertedTime && !isNaN(convertedTime.getTime()) && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    轉換後的時間
                  </Typography>
                  <Typography variant="h6">
                    {formatTime(convertedTime, toTimeZone)}
                  </Typography>
                </Box>
              )}
              {convertedWorkStartTime && !isNaN(convertedWorkStartTime.getTime()) && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    轉換後的上班時間
                  </Typography>
                  <Typography variant="h6">
                    {formatTime(convertedWorkStartTime, toTimeZone)}
                  </Typography>
                </Box>
              )}
              {convertedWorkEndTime && !isNaN(convertedWorkEndTime.getTime()) && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    轉換後的下班時間
                  </Typography>
                  <Typography variant="h6">
                    {formatTime(convertedWorkEndTime, toTimeZone)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
