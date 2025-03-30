import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Divider, 
  Chip, 
  IconButton, 
  useTheme,
  alpha,
  Card,
  CardHeader,
  CardContent,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Country } from '../types/index';
import { getTimeZoneOptions, calculateTimeZoneDifference } from '../utils/timezoneUtils';

interface CountryListTimeZoneConverterProps {
  userTimeZone: string;
  countries: Country[];
}

const CountryListTimeZoneConverter: React.FC<CountryListTimeZoneConverterProps> = ({ userTimeZone, countries }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  
  // 更新當前時間的計時器
  useEffect(() => {
    // 每分鐘強制重新渲染以更新時間顯示
    const timer = setInterval(() => {
      // 使用函數式更新確保我們不需要依賴任何狀態
      // 這只是為了觸發重新渲染
      setSelectedCountries(prev => [...prev]);
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // 過濾國家
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 處理搜索變更
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // 切換選擇國家
  const toggleCountrySelection = (country: Country) => {
    if (selectedCountries.some(c => c.code === country.code)) {
      setSelectedCountries(selectedCountries.filter(c => c.code !== country.code));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  // 獲取時區的顯示名稱
  const getTimeZoneDisplayName = (tz: string): string => {
    const options = getTimeZoneOptions();
    const option = options.find(opt => opt.value === tz);
    return option ? `${option.label} (${option.offset})` : tz;
  };

  // 計算特定時區的當前時間
  const getCurrentTimeInTimezone = (timezone: string): string => {
    try {
      const options = getTimeZoneOptions();
      const tzOption = options.find(opt => opt.value === timezone);
      
      if (!tzOption) return '--:--';
      
      const offsetStr = tzOption.offset;
      const offsetHours = parseFloat(offsetStr.replace('UTC', '').replace(':', '.'));
      
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const tzTime = new Date(utc + (3600000 * offsetHours));
      
      return tzTime.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error calculating timezone time:', error);
      return '--:--';
    }
  };

  // 計算與用戶時區的時差
  const getTimeDifference = (timezone: string): number => {
    return calculateTimeZoneDifference(timezone, userTimeZone);
  };

  // 獲取時差顯示
  const getTimeDifferenceDisplay = (diff: number): string => {
    if (diff === 0) return '相同時區';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff} 小時`;
  };

  // 獲取時差顏色
  const getTimeDiffColor = (diff: number): string => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 2) return theme.palette.success.main;
    if (absDiff <= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', mt: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PublicIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              目前支援的國家時區列表
            </Typography>
          </Box>
        }
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      />
      
      <CardContent>
        {/* 搜索框 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            <InputBase
              placeholder="搜索國家..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ fontSize: '0.875rem' }}
            />
            {searchTerm && (
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {/* 國家列表 */}
        <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 3 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>國家</TableCell>
                <TableCell>時區</TableCell>
                <TableCell align="center">當前時間</TableCell>
                <TableCell align="center">與您的時差</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCountries.map(country => (
                country.timezones && country.timezones.map((timezone, tzIndex) => (
                  <TableRow 
                    key={`${country.code}-${tzIndex}`}
                    sx={{ 
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                      cursor: 'pointer',
                      backgroundColor: selectedCountries.some(c => c.code === country.code) 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'inherit'
                    }}
                    onClick={() => toggleCountrySelection(country)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {tzIndex === 0 && (
                          <Box sx={{ mr: 1, fontSize: '1rem', width: 24, textAlign: 'center' }}>
                            {country.code.substring(0, 2)}
                          </Box>
                        )}
                        <Typography variant="body2">
                          {tzIndex === 0 ? country.name : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTimeZoneDisplayName(timezone)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={getCurrentTimeInTimezone(timezone)} 
                        size="small"
                        sx={{ 
                          height: 24, 
                          fontWeight: 'medium',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {(() => {
                        const diff = getTimeDifference(timezone);
                        return (
                          <Chip 
                            label={getTimeDifferenceDisplay(diff)} 
                            size="small"
                            sx={{ 
                              height: 24, 
                              fontWeight: 'medium',
                              color: getTimeDiffColor(diff),
                              backgroundColor: alpha(getTimeDiffColor(diff), 0.1),
                              border: `1px solid ${alpha(getTimeDiffColor(diff), 0.3)}`
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 選定國家的詳細信息 */}
        {selectedCountries.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              已選擇的國家
            </Typography>
            <Grid container spacing={2}>
              {selectedCountries.map(country => (
                <Grid item xs={12} sm={6} md={4} key={country.code}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, fontSize: '1rem', width: 24, textAlign: 'center' }}>
                        {country.code.substring(0, 2)}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {country.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        sx={{ ml: 'auto' }}
                        onClick={() => toggleCountrySelection(country)}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ mt: 1 }}>
                      {country.timezones && country.timezones.map((timezone, index) => {
                        const diff = getTimeDifference(timezone);
                        return (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {getTimeZoneDisplayName(timezone)}
                              </Typography>
                              <Chip 
                                label={getCurrentTimeInTimezone(timezone)} 
                                size="small"
                                sx={{ 
                                  height: 20, 
                                  '& .MuiChip-label': { px: 1, py: 0 },
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                與您的時差:
                              </Typography>
                              <Box 
                                sx={{ 
                                  ml: 1, 
                                  px: 1, 
                                  py: 0.2, 
                                  borderRadius: 1,
                                  backgroundColor: alpha(getTimeDiffColor(diff), 0.1),
                                  border: `1px solid ${alpha(getTimeDiffColor(diff), 0.3)}`
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontWeight: 'medium',
                                    color: getTimeDiffColor(diff)
                                  }}
                                >
                                  {getTimeDifferenceDisplay(diff)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryListTimeZoneConverter;
