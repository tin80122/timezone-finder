import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Box, 
  Typography,
  ListSubheader,
  Paper,
  Divider,
  Chip,
  InputBase,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TimeZoneOption } from '../types/index';

interface TimeZoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeZoneOption[];
}

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({ value, onChange, options }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  
  // 從本地存儲加載收藏的時區
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
  
  // 保存收藏的時區到本地存儲
  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem('favoriteTimezones', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };
  
  // 處理時區選擇變化
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
    setSearchTerm('');
  };
  
  // 處理搜索輸入變化
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // 清除搜索
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // 切換收藏狀態
  const toggleFavorite = (tzValue: string) => {
    if (favorites.includes(tzValue)) {
      saveFavorites(favorites.filter(fav => fav !== tzValue));
    } else {
      saveFavorites([...favorites, tzValue]);
    }
  };
  
  // 獲取當前選擇的時區信息
  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption?.label || '';
  const selectedOffset = selectedOption?.offset || '';
  
  // 將選項按區域分組
  const groupedOptions: Record<string, TimeZoneOption[]> = {};
  
  // 收藏的時區
  const favoriteOptions = options.filter(option => favorites.includes(option.value));
  
  // 過濾和分組選項
  options.forEach(option => {
    // 如果有搜索詞，則過濾
    if (searchTerm && !option.label.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !option.offset.toLowerCase().includes(searchTerm.toLowerCase())) {
      return;
    }
    
    const region = option.label.split('/')[0];
    if (!groupedOptions[region]) {
      groupedOptions[region] = [];
    }
    groupedOptions[region].push(option);
  });
  
  // 獲取當前時間在選定時區的顯示
  const getCurrentTimeInTimezone = (offsetStr: string) => {
    try {
      const now = new Date();
      const offsetHours = parseFloat(offsetStr.replace('UTC', '').replace(':', '.'));
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
  
  // 獲取當前選擇時區的時間
  const currentTimeInSelectedTz = selectedOffset ? getCurrentTimeInTimezone(selectedOffset) : '';

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PublicIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            時區選擇
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          選擇您的當地時區，用於計算與其他國家的時差
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            p: 1,
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ mr: 1.5 }}>
              <Tooltip title={favorites.includes(value) ? '從收藏中移除' : '添加到收藏'}>
                <IconButton 
                  size="small" 
                  onClick={() => toggleFavorite(value)}
                  color={favorites.includes(value) ? 'primary' : 'default'}
                >
                  {favorites.includes(value) ? 
                    <FavoriteIcon fontSize="small" /> : 
                    <FavoriteBorderIcon fontSize="small" />
                  }
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {selectedLabel}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {selectedOffset}
                </Typography>
                {currentTimeInSelectedTz && (
                  <Chip 
                    icon={<AccessTimeIcon fontSize="small" />} 
                    label={currentTimeInSelectedTz} 
                    size="small"
                    sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        <FormControl fullWidth variant="outlined">
          <InputLabel id="timezone-select-label">選擇時區</InputLabel>
          <Select
            labelId="timezone-select-label"
            id="timezone-select"
            value={value}
            label="選擇時區"
            onChange={handleChange}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => {
              setOpen(false);
              setSearchTerm('');
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 400,
                },
              },
              MenuListProps: {
                style: { padding: 0 }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
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
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                <InputBase
                  placeholder="搜索時區..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  sx={{ fontSize: '0.875rem' }}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
            
            {/* 收藏的時區 */}
            {favoriteOptions.length > 0 && [
              <ListSubheader key="favorites" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                收藏的時區
              </ListSubheader>,
              ...favoriteOptions.map(option => (
                <MenuItem key={`fav-${option.value}`} value={option.value}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography>{option.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {option.offset}
                      </Typography>
                      <Chip 
                        label={getCurrentTimeInTimezone(option.offset)} 
                        size="small"
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                      />
                    </Box>
                  </Box>
                </MenuItem>
              )),
              <Divider key="fav-divider" />
            ]}
            
            {/* 按區域分組的時區 */}
            {Object.keys(groupedOptions).length > 0 ? (
              Object.keys(groupedOptions).sort().map(region => [
                <ListSubheader key={region} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  {region}
                </ListSubheader>,
                ...groupedOptions[region]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        width: '100%', 
                        alignItems: 'center',
                        '&:hover .favorite-icon': {
                          opacity: 1
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
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
                            {favorites.includes(option.value) ? 
                              <FavoriteIcon fontSize="small" /> : 
                              <FavoriteBorderIcon fontSize="small" />
                            }
                          </IconButton>
                          <Typography>{option.label}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {option.offset}
                          </Typography>
                          <Chip 
                            label={getCurrentTimeInTimezone(option.offset)} 
                            size="small"
                            sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                          />
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
              ]).flat()
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {searchTerm ? '沒有符合搜索條件的時區' : '沒有可用的時區'}
                </Typography>
              </Box>
            )}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default TimeZoneSelector;
