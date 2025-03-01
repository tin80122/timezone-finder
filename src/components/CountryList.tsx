import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  List, 
  ListItem, 
  Divider,
  Box,
  Chip,
  Grid,
  Avatar,
  Paper,
  InputBase,
  IconButton,
  Tooltip,
  CardContent,
  Collapse,
  Button,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Card,
  CardHeader,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PublicIcon from '@mui/icons-material/Public';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import FlagIcon from '@mui/icons-material/Flag';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SortIcon from '@mui/icons-material/Sort';
import LanguageIcon from '@mui/icons-material/Language';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WorkIcon from '@mui/icons-material/Work';
import { Country } from '../types/index';
import { calculateTimeDifference, formatTime } from '../utils/timezoneUtils';

interface CountryListProps {
  userTimeZone: string;
  filteredCountries: Country[];
}

// 排序選項
type SortOption = 'timeDiff' | 'name' | 'workingHours';

// 過濾選項
type TimeFilter = 'all' | 'working' | 'awake' | 'night';

const CountryList: React.FC<CountryListProps> = ({ userTimeZone, filteredCountries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('timeDiff');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  
  // 重置分頁當過濾條件變更
  useEffect(() => {
    setPage(1);
  }, [searchTerm, timeFilter, sortBy]);
  
  // 獲取時間狀態（工作時間、清醒時間、夜間時間）
  const getTimeStatus = (localHour: number): { color: string; label: string; type: TimeFilter } => {
    if (localHour >= 9 && localHour < 18) {
      return { color: '#4CAF50', label: '工作時間', type: 'working' };
    } else if (localHour >= 7 && localHour < 23) {
      return { color: '#FFC107', label: '清醒時間', type: 'awake' };
    } else {
      return { color: '#F44336', label: '夜間時間', type: 'night' };
    }
  };
  
  // 處理搜尋輸入變更
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // 清除搜尋
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // 處理排序變更
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortOption);
  };
  
  // 處理時間過濾變更
  const handleTimeFilterChange = (_event: React.SyntheticEvent, newValue: TimeFilter) => {
    setTimeFilter(newValue);
  };
  
  // 處理分頁變更
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // 處理每頁行數變更
  const handleRowsPerPageChange = (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  
  // 切換展開/收起國家詳情
  const toggleExpand = (countryCode: string) => {
    if (expandedCountry === countryCode) {
      setExpandedCountry(null);
    } else {
      setExpandedCountry(countryCode);
    }
  };
  
  // 展開所有國家
  const expandAll = () => {
    if (expandedCountry === 'all') {
      setExpandedCountry(null);
    } else {
      setExpandedCountry('all');
    }
  };
  
  // 使用 useMemo 處理國家過濾和排序，避免不必要的重新計算
  const processedCountries = useMemo(() => {
    // 計算每個國家的當前時間和時間狀態
    const countriesWithTime = filteredCountries.map(country => {
      const timeDiff = calculateTimeDifference(country.code, userTimeZone);
      const now = new Date();
      const localTime = new Date(now.getTime() + timeDiff * 60 * 60 * 1000);
      const localHour = localTime.getHours();
      const timeStatus = getTimeStatus(localHour);
      
      return {
        ...country,
        timeDiff,
        localTime,
        localHour,
        timeStatus
      };
    });
    
    // 應用搜尋過濾
    let filtered = countriesWithTime;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(term) || 
        country.capital.toLowerCase().includes(term) ||
        country.code.toLowerCase().includes(term)
      );
    }
    
    // 應用時間狀態過濾
    if (timeFilter !== 'all') {
      filtered = filtered.filter(country => country.timeStatus.type === timeFilter);
    }
    
    // 應用排序
    const sorted = [...filtered];
    switch (sortBy) {
      case 'timeDiff':
        sorted.sort((a, b) => Math.abs(a.timeDiff) - Math.abs(b.timeDiff));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'workingHours':
        // 優先顯示工作時間的國家，然後是清醒時間，最後是夜間時間
        sorted.sort((a, b) => {
          const priorityA = a.timeStatus.type === 'working' ? 0 : a.timeStatus.type === 'awake' ? 1 : 2;
          const priorityB = b.timeStatus.type === 'working' ? 0 : b.timeStatus.type === 'awake' ? 1 : 2;
          return priorityA - priorityB;
        });
        break;
    }
    
    return sorted;
  }, [filteredCountries, searchTerm, timeFilter, sortBy, userTimeZone]);
  
  // 計算分頁
  const paginatedCountries = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return processedCountries.slice(startIndex, startIndex + rowsPerPage);
  }, [processedCountries, page, rowsPerPage]);
  
  // 計算時間過濾器的計數
  const filterCounts = useMemo(() => {
    const counts = {
      all: filteredCountries.length,
      working: 0,
      awake: 0,
      night: 0
    };
    
    filteredCountries.forEach(country => {
      const timeDiff = calculateTimeDifference(country.code, userTimeZone);
      const now = new Date();
      const localTime = new Date(now.getTime() + timeDiff * 60 * 60 * 1000);
      const localHour = localTime.getHours();
      const timeStatus = getTimeStatus(localHour);
      
      counts[timeStatus.type]++;
    });
    
    return counts;
  }, [filteredCountries, userTimeZone]);
  
  // 獲取時間差距的顏色
  const getTimeDiffColor = (diff: number): string => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 2) return theme.palette.success.main;
    if (absDiff <= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // 獲取時間差距的標籤
  const getTimeDiffLabel = (diff: number): string => {
    if (diff === 0) return '相同時區';
    return `${diff > 0 ? '+' : ''}${diff} 小時`;
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlagIcon sx={{ mr: 1 }} />
            <Typography variant="h6">符合條件的國家</Typography>
            <Chip 
              label={processedCountries.length} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          </Box>
        }
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1
        }}
      />
      
      {/* 過濾和搜尋工具列 */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          {/* 搜尋框 */}
          <Grid item xs={12} md={6}>
            <Paper 
              component="form" 
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="搜尋國家、首都或國家代碼"
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={<SearchIcon sx={{ color: 'action.active', mr: 1 }} />}
              />
              {searchTerm && (
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
          </Grid>
          
          {/* 排序選擇器 */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label">排序方式</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="排序方式"
                onChange={handleSortChange}
                startAdornment={<SortIcon sx={{ color: 'action.active', mr: 1 }} />}
              >
                <MenuItem value="timeDiff">時差（由小到大）</MenuItem>
                <MenuItem value="name">國家名稱（字母順序）</MenuItem>
                <MenuItem value="workingHours">時間狀態（優先工作時間）</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* 每頁行數選擇器 */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="rows-select-label">每頁顯示</InputLabel>
              <Select
                labelId="rows-select-label"
                id="rows-select"
                value={rowsPerPage.toString()}
                label="每頁顯示"
                onChange={handleRowsPerPageChange}
              >
                <MenuItem value="5">5 個國家</MenuItem>
                <MenuItem value="10">10 個國家</MenuItem>
                <MenuItem value="20">20 個國家</MenuItem>
                <MenuItem value="50">50 個國家</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* 時間狀態過濾器 */}
        <Box sx={{ mt: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Tabs 
            value={timeFilter} 
            onChange={handleTimeFilterChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2
              }
            }}
          >
            <Tab 
              icon={<FilterListIcon />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  全部
                  <Chip 
                    label={filterCounts.all} 
                    size="small" 
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              } 
              value="all" 
            />
            <Tab 
              icon={<WorkIcon sx={{ color: '#4CAF50' }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  工作時間
                  <Chip 
                    label={filterCounts.working} 
                    size="small" 
                    sx={{ ml: 1, height: 20, bgcolor: alpha('#4CAF50', 0.1) }}
                  />
                </Box>
              } 
              value="working" 
            />
            <Tab 
              icon={<WbSunnyIcon sx={{ color: '#FFC107' }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  清醒時間
                  <Chip 
                    label={filterCounts.awake} 
                    size="small" 
                    sx={{ ml: 1, height: 20, bgcolor: alpha('#FFC107', 0.1) }}
                  />
                </Box>
              } 
              value="awake" 
            />
            <Tab 
              icon={<NightsStayIcon sx={{ color: '#F44336' }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  夜間時間
                  <Chip 
                    label={filterCounts.night} 
                    size="small" 
                    sx={{ ml: 1, height: 20, bgcolor: alpha('#F44336', 0.1) }}
                  />
                </Box>
              } 
              value="night" 
            />
          </Tabs>
        </Box>
      </Box>
      
      {/* 國家列表 */}
      {paginatedCountries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            沒有找到符合條件的國家
          </Typography>
          <Typography variant="body2" color="text.secondary">
            嘗試調整您的搜尋條件或時間過濾器
          </Typography>
          {searchTerm && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleClearSearch}
              startIcon={<ClearIcon />}
              sx={{ mt: 2 }}
            >
              清除搜尋
            </Button>
          )}
        </Box>
      ) : (
        <>
          <List sx={{ p: 0, bgcolor: 'background.paper' }}>
            {paginatedCountries.map((country, index) => {
              const isExpanded = expandedCountry === country.code || expandedCountry === 'all';
              
              return (
                <Box key={country.code}>
                  <ListItem 
                    sx={{ 
                      py: 1.5, 
                      borderLeft: `4px solid ${country.timeStatus.color}`,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpand(country.code)}
                  >
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              mr: 1.5, 
                              bgcolor: alpha(country.timeStatus.color, 0.8),
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {country.code}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {country.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="textSecondary" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                              }}
                            >
                              <LocationCityIcon sx={{ fontSize: 12, mr: 0.5 }} />
                              {country.capital || '無首都資料'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Tooltip title="與您的時區差距">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon 
                              sx={{ 
                                fontSize: 16, 
                                mr: 0.5, 
                                color: getTimeDiffColor(country.timeDiff) 
                              }} 
                            />
                            <Chip 
                              size="small" 
                              label={getTimeDiffLabel(country.timeDiff)} 
                              sx={{ 
                                height: 20, 
                                bgcolor: alpha(getTimeDiffColor(country.timeDiff), 0.1),
                                color: getTimeDiffColor(country.timeDiff),
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={5} sm={3}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                        }}>
                          <Tooltip title={country.timeStatus.label}>
                            <Box 
                              component="span" 
                              sx={{ 
                                display: 'inline-block', 
                                width: 10, 
                                height: 10, 
                                borderRadius: '50%', 
                                bgcolor: country.timeStatus.color, 
                                mr: 1,
                                border: '1px solid white',
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                              }} 
                            />
                          </Tooltip>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 'medium',
                              color: country.timeStatus.color
                            }}
                          >
                            {formatTime(country.localTime, country.timezones[0])}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={1} sm={1} sx={{ textAlign: 'right' }}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Grid>
                    </Grid>
                  </ListItem>
                  
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <CardContent sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
                            時區資訊
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {country.timezones.map((timezone, i) => (
                              <Chip
                                key={i}
                                icon={<PublicIcon fontSize="small" />}
                                label={timezone}
                                size="small"
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            當地時間狀態
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: country.timeStatus.color, 
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {country.timeStatus.label} ({country.localHour}:00)
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: alpha(country.timeStatus.color, 0.1),
                            border: `1px solid ${alpha(country.timeStatus.color, 0.3)}`
                          }}>
                            <Typography variant="body2">
                              當您的時間是 <b>{formatTime(new Date(), userTimeZone)}</b>，
                              {country.name} 的時間是 <b>{formatTime(country.localTime, country.timezones[0])}</b>
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                  
                  {index < paginatedCountries.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
          
          {/* 分頁控制 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider' 
          }}>
            <Button 
              size="small" 
              onClick={expandAll}
              startIcon={expandedCountry === 'all' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expandedCountry === 'all' ? '收起全部' : '展開全部'}
            </Button>
            
            <Pagination 
              count={Math.ceil(processedCountries.length / rowsPerPage)} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
            
            <Typography variant="caption" color="text.secondary">
              顯示 {Math.min((page - 1) * rowsPerPage + 1, processedCountries.length)} - {Math.min(page * rowsPerPage, processedCountries.length)} 
              {' '}共 {processedCountries.length} 個國家
            </Typography>
          </Box>
        </>
      )}
    </Card>
  );
};

export default CountryList;
