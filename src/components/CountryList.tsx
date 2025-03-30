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

// 排序選項
type SortOption = 'timeDiff' | 'name' | 'workingHours';

// 過濾選項
type TimeFilter = 'all' | 'working' | 'awake' | 'night';

interface CountryListProps {
  userTimeZone: string;
  filteredCountries: Country[];
}

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

    let filtered = countriesWithTime;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(term) || 
        country.capital.toLowerCase().includes(term) ||
        country.code.toLowerCase().includes(term)
      );
    }

    if (timeFilter !== 'all') {
      filtered = filtered.filter(country => country.timeStatus.type === timeFilter);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'timeDiff':
        sorted.sort((a, b) => Math.abs(a.timeDiff) - Math.abs(b.timeDiff));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'workingHours':
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
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', maxWidth: { xs: '400px', sm: 'none' } }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlagIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              符合條件的國家
            </Typography>
            <Chip 
              label={processedCountries.length} 
              size="small" 
              color="primary" 
              sx={{ ml: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 18, sm: 20 } }}
            />
          </Box>
        }
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 0.75, sm: 1 }
        }}
      />

      {/* 過濾和搜尋工具列 */}
      <Box sx={{ p: { xs: 1, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Paper 
              component="form" 
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '100%'
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: { xs: '0.85rem', sm: '1rem' } }}
                placeholder="搜尋國家、首都或代碼"
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={<SearchIcon sx={{ color: 'action.active', mr: 1, fontSize: { xs: 18, sm: 20 } }} />}
              />
              {searchTerm && (
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                排序方式
              </InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="排序方式"
                onChange={handleSortChange}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                startAdornment={<SortIcon sx={{ color: 'action.active', mr: 1, fontSize: { xs: 16, sm: 18 } }} />}
              >
                <MenuItem value="timeDiff" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  時差（由小到大）
                </MenuItem>
                <MenuItem value="name" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  國家名稱（字母順序）
                </MenuItem>
                <MenuItem value="workingHours" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  時間狀態（優先工作時間）
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="rows-select-label" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                每頁顯示
              </InputLabel>
              <Select
                labelId="rows-select-label"
                id="rows-select"
                value={rowsPerPage.toString()}
                label="每頁顯示"
                onChange={handleRowsPerPageChange}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                <MenuItem value="5" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>5 個國家</MenuItem>
                <MenuItem value="10" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>10 個國家</MenuItem>
                <MenuItem value="20" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>20 個國家</MenuItem>
                <MenuItem value="50" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>50 個國家</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
          <Tabs 
            value={timeFilter} 
            onChange={handleTimeFilterChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab 
              icon={<FilterListIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  全部
                  <Chip 
                    label={filterCounts.all} 
                    size="small" 
                    sx={{ ml: 0.5, height: { xs: 16, sm: 20 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                  />
                </Box>
              } 
              value="all" 
            />
            <Tab 
              icon={<WorkIcon sx={{ color: '#4CAF50', fontSize: { xs: 16, sm: 18 } }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  工作時間
                  <Chip 
                    label={filterCounts.working} 
                    size="small" 
                    sx={{ ml: 0.5, height: { xs: 16, sm: 20 }, bgcolor: alpha('#4CAF50', 0.1), fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                  />
                </Box>
              } 
              value="working" 
            />
            <Tab 
              icon={<WbSunnyIcon sx={{ color: '#FFC107', fontSize: { xs: 16, sm: 18 } }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  清醒時間
                  <Chip 
                    label={filterCounts.awake} 
                    size="small" 
                    sx={{ ml: 0.5, height: { xs: 16, sm: 20 }, bgcolor: alpha('#FFC107', 0.1), fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                  />
                </Box>
              } 
              value="awake" 
            />
            <Tab 
              icon={<NightsStayIcon sx={{ color: '#F44336', fontSize: { xs: 16, sm: 18 } }} />} 
              iconPosition="start" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  夜間時間
                  <Chip 
                    label={filterCounts.night} 
                    size="small" 
                    sx={{ ml: 0.5, height: { xs: 16, sm: 20 }, bgcolor: alpha('#F44336', 0.1), fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
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
        <Box sx={{ textAlign: 'center', py: 4, px: 1 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            沒有找到符合條件的國家
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            嘗試調整您的搜尋條件或時間過濾器
          </Typography>
          {searchTerm && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleClearSearch}
              startIcon={<ClearIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
                      py: { xs: 0.5, sm: 1.5 }, 
                      px: { xs: 1, sm: 2 },
                      borderLeft: `3px solid ${country.timeStatus.color}`,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      cursor: 'pointer',
                      width: '100%',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 0.5, sm: 0 }
                    }}
                    onClick={() => toggleExpand(country.code)}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.25, sm: 0 } }}>
                        <Avatar 
                          sx={{ 
                            width: { xs: 20, sm: 36 }, 
                            height: { xs: 20, sm: 36 }, 
                            mr: { xs: 1, sm: 1.5 }, 
                            bgcolor: alpha(country.timeStatus.color, 0.8),
                            fontSize: { xs: '0.6rem', sm: '0.8rem' },
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}
                        >
                          {country.code}
                        </Avatar>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '0.85rem', sm: '1rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: { xs: '250px', sm: 'none' }
                          }}
                        >
                          {country.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0.25, sm: 0 }, flexWrap: 'wrap', gap: 0.5 }}>
                        <AccessTimeIcon 
                          sx={{ 
                            fontSize: { xs: 12, sm: 16 }, 
                            mr: 0.5, 
                            color: getTimeDiffColor(country.timeDiff),
                            flexShrink: 0
                          }} 
                        />
                        <Chip 
                          size="small" 
                          label={getTimeDiffLabel(country.timeDiff)} 
                          sx={{ 
                            height: { xs: 16, sm: 20 }, 
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            px: 0.5,
                            bgcolor: alpha(getTimeDiffColor(country.timeDiff), 0.1),
                            color: getTimeDiffColor(country.timeDiff),
                            fontWeight: 'medium'
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 'medium',
                            color: country.timeStatus.color,
                            fontSize: { xs: '0.65rem', sm: '0.8rem' },
                            ml: 0.5
                          }}
                        >
                          {formatTime(country.localTime, country.timezones[0])}
                        </Typography>
                      </Box>
                    </Box>
                    {isExpanded ? (
                      <ExpandLessIcon sx={{ fontSize: { xs: 16, sm: 20 }, ml: { xs: 0, sm: 'auto' }, mt: { xs: 0.5, sm: 0 } }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: { xs: 16, sm: 20 }, ml: { xs: 0, sm: 'auto' }, mt: { xs: 0.5, sm: 0 } }} />
                    )}
                  </ListItem>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <CardContent sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                      <Grid container spacing={{ xs: 1, sm: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography 
                            variant="subtitle2" 
                            gutterBottom 
                            sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            <LanguageIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: 14, sm: 16 } }} />
                            時區資訊
                          </Typography>
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap' }}>
                            {country.timezones.map((timezone, i) => (
                              <Chip
                                key={i}
                                icon={<PublicIcon fontSize="small" sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                label={timezone}
                                size="small"
                                sx={{ 
                                  m: 0.25, 
                                  height: { xs: 20, sm: 28 },
                                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                }}
                              />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography 
                            variant="subtitle2" 
                            gutterBottom 
                            sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: { xs: 14, sm: 16 } }} />
                            當地時間狀態
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, mt: 0.5 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: country.timeStatus.color, 
                                mr: 1,
                                flexShrink: 0
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                              {country.timeStatus.label} ({country.localHour}:00)
                            </Typography>
                          </Box>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}
                          >
                            <LocationCityIcon sx={{ fontSize: 12, mr: 0.5, flexShrink: 0 }} />
                            {country.capital || '無首都資料'}
                          </Typography>
                          <Box sx={{ 
                            p: { xs: 0.5, sm: 1 }, 
                            borderRadius: 1, 
                            bgcolor: alpha(country.timeStatus.color, 0.1),
                            border: `1px solid ${alpha(country.timeStatus.color, 0.3)}`
                          }}>
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
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

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 0 },
            p: { xs: 1, sm: 2 }, 
            borderTop: '1px solid', 
            borderColor: 'divider' 
          }}>
            <Button 
              size="small" 
              onClick={expandAll}
              startIcon={expandedCountry === 'all' ? <ExpandLessIcon sx={{ fontSize: { xs: 14, sm: 16 } }} /> : <ExpandMoreIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {expandedCountry === 'all' ? '收起全部' : '展開全部'}
            </Button>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'center', sm: 'center' },
              width: { xs: '100%', sm: 'auto' },
              gap: 1
            }}>
              <Pagination 
                count={Math.ceil(processedCountries.length / rowsPerPage)} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '0.65rem', sm: '0.875rem' },
                    minWidth: { xs: 20, sm: 32 },
                    height: { xs: 20, sm: 32 },
                  }
                }}
              />
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: { xs: 'block', sm: 'inline' }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
              >
                顯示 {Math.min((page - 1) * rowsPerPage + 1, processedCountries.length)} - {Math.min(page * rowsPerPage, processedCountries.length)} 
                {' '}共 {processedCountries.length} 個國家
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
};

export default CountryList;
