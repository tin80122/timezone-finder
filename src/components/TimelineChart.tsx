import React, { useState } from 'react';
import { Box, Typography, Tooltip, Chip, Grid, Divider, Paper, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Country } from '../types/index';
import { calculateTimeDifference } from '../utils/timezoneUtils';

interface TimelineChartProps {
  userTimeZone: string;
  filteredCountries: Country[];
  workTime: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ 
  userTimeZone, 
  filteredCountries,
  workTime
}) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  
  // 獲取工作時間的小時部分
  const workHour = parseInt(workTime.split(':')[0]);
  
  // 獲取時差大小的顏色
  const getTimeDiffColor = (timeDiff: number): string => {
    const absDiff = Math.abs(timeDiff);
    
    if (absDiff <= 3) {
      return '#4CAF50'; // 綠色 - 時差小
    } else if (absDiff <= 7) {
      return '#FFC107'; // 黃色 - 時差中等
    } else if (absDiff <= 11) {
      return '#FF9800'; // 橙色 - 時差較大
    } else {
      return '#F44336'; // 紅色 - 時差極大
    }
  };
  
  // 獲取時差大小的標籤
  const getTimeDiffLabel = (timeDiff: number): string => {
    const absDiff = Math.abs(timeDiff);
    
    if (absDiff <= 3) {
      return '時差小 (0-3小時)';
    } else if (absDiff <= 7) {
      return '時差中等 (4-7小時)';
    } else if (absDiff <= 11) {
      return '時差較大 (8-11小時)';
    } else {
      return '時差極大 (12+小時)';
    }
  };
  
  // 獲取當地時間狀態
  const getLocalTimeStatus = (localHour: number): { icon: React.ReactNode; label: string } => {
    if (localHour >= 7 && localHour < 18) {
      return { 
        icon: <WbSunnyIcon sx={{ fontSize: 'inherit', color: '#FFC107' }} />, 
        label: '白天時間' 
      };
    } else {
      return { 
        icon: <NightsStayIcon sx={{ fontSize: 'inherit', color: '#3f51b5' }} />, 
        label: '夜晚時間' 
      };
    }
  };
  
  // 計算當地時間的小時部分
  const calculateLocalHour = (countryCode: string): number => {
    const timeDiff = calculateTimeDifference(countryCode, userTimeZone);
    const localHour = (workHour + timeDiff + 24) % 24;
    return Math.floor(localHour);
  };
  
  // 格式化小時為12小時制
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };
  
  // 根據時差對國家進行分組
  const groupCountriesByTimeDiff = () => {
    const groups: Record<number, Country[]> = {};
    
    filteredCountries.forEach(country => {
      const timeDiff = calculateTimeDifference(country.code, userTimeZone);
      if (!groups[timeDiff]) {
        groups[timeDiff] = [];
      }
      groups[timeDiff].push(country);
    });
    
    return Object.entries(groups)
      .map(([diff, countries]) => ({
        timeDiff: parseInt(diff),
        countries,
        localHour: (workHour + parseInt(diff) + 24) % 24
      }))
      .sort((a, b) => Math.abs(a.timeDiff) - Math.abs(b.timeDiff));
  };
  
  const countryGroups = groupCountriesByTimeDiff();
  
  // 處理時間線上的點擊
  const handleTimelineClick = (hour: number) => {
    setSelectedHour(selectedHour === hour ? null : hour);
  };
  
  // 獲取特定小時的國家
  const getCountriesAtHour = (hour: number): Country[] => {
    return filteredCountries.filter(country => {
      const localHour = calculateLocalHour(country.code);
      return Math.floor(localHour) === hour;
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          時間線圖表 - 當台灣是 {formatHour(workHour)} 時
        </Typography>
        <IconButton 
          onClick={() => setExpanded(!expanded)} 
          size="small"
          sx={{ ml: 1 }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Collapse in={expanded}>
        <Box sx={{ 
          position: 'relative', 
          height: filteredCountries.length > 20 ? '200px' : '160px', // 根據國家數量調整高度
          width: '100%', 
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          mb: 2,
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* 背景網格 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <Box 
              key={`grid-${i}`}
              sx={{ 
                position: 'absolute', 
                top: 0, 
                bottom: 0, 
                left: `${(i / 12) * 100}%`, 
                width: '1px', 
                backgroundColor: 'rgba(0,0,0,0.05)',
                zIndex: 1
              }} 
            />
          ))}
          
          {/* 白天時間區域 */}
          <Box sx={{ 
            position: 'absolute', 
            top: '30%', 
            height: '40%', 
            left: `${(7 / 24) * 100}%`, 
            width: `${((18 - 7) / 24) * 100}%`, 
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
            borderTop: '1px dashed rgba(255, 235, 59, 0.5)',
            borderBottom: '1px dashed rgba(255, 235, 59, 0.5)',
            zIndex: 0
          }} />
          
          {/* 時間線 */}
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: 0, 
            right: 0, 
            height: '2px', 
            backgroundColor: '#ccc',
            transform: 'translateY(-50%)',
            zIndex: 2
          }} />
          
          {/* 中心點 - 台灣時間 */}
          <Tooltip title={`台灣時間: ${formatHour(workHour)}`}>
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: `${(workHour / 24) * 100}%`, 
              width: '16px', 
              height: '16px', 
              backgroundColor: '#1976d2', 
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              border: '2px solid white',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer'
            }} 
              onClick={() => handleTimelineClick(workHour)}
            />
          </Tooltip>
          
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: '65%', 
              left: `${(workHour / 24) * 100}%`, 
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              px: 0.5,
              py: 0.2,
              borderRadius: '2px',
              zIndex: 3
            }}
          >
            台灣 {formatHour(workHour)}
          </Typography>
          
          {/* 時間刻度和標籤 */}
          {Array.from({ length: 25 }).map((_, i) => {
            const showLabel = i % 3 === 0 || i === 24; // 每3小時顯示一次標籤
            return (
              <React.Fragment key={i}>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: `${(i / 24) * 100}%`, 
                    width: '1px', 
                    height: showLabel ? '16px' : '10px', 
                    backgroundColor: showLabel ? '#666' : '#999',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    cursor: 'pointer'
                  }} 
                  onClick={() => handleTimelineClick(i % 24)}
                />
                {showLabel && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: '75%',
                      left: `${(i / 24) * 100}%`,
                      transform: 'translateX(-50%)',
                      color: '#666',
                      fontSize: '0.7rem',
                      fontWeight: 'medium',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      px: 0.5,
                      borderRadius: '2px',
                      zIndex: 3
                    }}
                  >
                    {i === 24 ? '24:00' : `${i}:00`}
                  </Typography>
                )}
              </React.Fragment>
            );
          })}
          
          {/* 國家時間點 */}
          {filteredCountries.map((country, index) => {
            const localHour = calculateLocalHour(country.code);
            const position = ((localHour / 24) * 100);
            const timeDiff = calculateTimeDifference(country.code, userTimeZone);
            
            // 計算y軸位置 - 使用更複雜的分佈算法避免點重疊
            // 結合正弦和餘弦函數創建更均勻的分佈
            const baseY = 50; // 基準線在中間
            const amplitude = filteredCountries.length > 20 ? 35 : 25; // 振幅，根據國家數量調整
            
            // 使用黃金分割比例來分配點，避免規律性重疊
            const phi = 0.618033988749895;
            const normalizedIndex = ((index * phi) % 1) * 2 * Math.PI;
            
            // 結合正弦和餘弦以創建更複雜的波形
            const yOffset = Math.sin(normalizedIndex) * Math.cos(normalizedIndex * 0.5) * amplitude;
            const yPosition = baseY + yOffset;
            
            // 計算點的大小和樣式 - 根據與台灣時差的絕對值調整
            const absDiff = Math.abs(timeDiff);
            const pointSize = 6 + (absDiff / 12) * 4; // 6-10px 範圍
            
            // 計算邊框寬度 - 時差越小邊框越粗，突出相近時區
            const borderWidth = absDiff <= 3 ? 2 : 1;
            
            // 計算點的不透明度 - 時差越大越透明
            const opacity = Math.max(0.5, 1 - (absDiff / 24) * 0.5);
            
            // 判斷是否為選中的小時
            const isSelected = selectedHour !== null && Math.floor(localHour) === selectedHour;
            
            return (
              <React.Fragment key={`${country.code}-${index}`}>
                {/* 連接線 */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: `${position}%`, 
                    width: '1px', 
                    height: `${Math.abs(50 - yPosition)}%`, 
                    backgroundColor: getTimeDiffColor(timeDiff),
                    opacity: isSelected ? 0.9 : 0.5,
                    transform: yPosition < 50 
                      ? 'translateX(-50%)' 
                      : 'translateX(-50%) translateY(-100%)',
                    zIndex: isSelected ? 4 : 1,
                    transition: 'all 0.3s ease'
                  }} 
                />
                
                {/* 時間點 */}
                <Tooltip 
                  title={
                    <React.Fragment>
                      <Typography variant="subtitle2">{country.name}</Typography>
                      <Typography variant="body2">當地時間: {formatHour(localHour)}</Typography>
                      <Typography variant="body2">
                        時差: {timeDiff > 0 ? '+' : ''}{timeDiff} 小時
                      </Typography>
                      <Typography variant="body2">
                        {getTimeDiffLabel(timeDiff)}
                      </Typography>
                      <Typography variant="body2">
                        {getLocalTimeStatus(localHour).label}
                      </Typography>
                    </React.Fragment>
                  }
                  placement="top"
                  arrow
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: `${yPosition}%`, 
                      left: `${position}%`, 
                      width: `${isSelected ? pointSize * 1.5 : pointSize}px`, 
                      height: `${isSelected ? pointSize * 1.5 : pointSize}px`, 
                      backgroundColor: getTimeDiffColor(timeDiff),
                      opacity: isSelected ? 1 : opacity,
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: isSelected ? 6 : 4,
                      border: `${isSelected ? borderWidth + 1 : borderWidth}px solid white`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 0 8px rgba(0, 0, 0, 0.5)' : 'none',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.5)',
                        zIndex: 7,
                        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)'
                      }
                    }} 
                    onClick={() => handleTimelineClick(Math.floor(localHour))}
                  />
                </Tooltip>
              </React.Fragment>
            );
          })}
          
          {/* 選中小時的國家列表 */}
          {selectedHour !== null && (
            <Paper 
              elevation={3} 
              sx={{ 
                position: 'absolute', 
                top: '10%', 
                left: `${(selectedHour / 24) * 100}%`, 
                transform: 'translateX(-50%)',
                p: 1, 
                maxWidth: '200px', 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 10,
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2">
                  {formatHour(selectedHour)} 的國家
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setSelectedHour(null)}
                  sx={{ p: 0.5 }}
                >
                  <ExpandLessIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ maxHeight: '100px', overflowY: 'auto' }}>
                {getCountriesAtHour(selectedHour).length > 0 ? (
                  getCountriesAtHour(selectedHour).map(country => {
                    const timeDiff = calculateTimeDifference(country.code, userTimeZone);
                    return (
                      <Chip 
                        key={country.code}
                        label={country.name}
                        size="small"
                        sx={{ 
                          m: 0.2, 
                          backgroundColor: getTimeDiffColor(timeDiff),
                          color: Math.abs(timeDiff) > 11 ? 'white' : 'inherit'
                        }}
                      />
                    );
                  })
                ) : (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}>
                    沒有國家在此時間
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Box>
        
        {/* 圖例和國家時間對照表 */}
        <Grid container spacing={2}>
          {/* 左側圖例 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 1.5, height: '100%', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom align="center">
                顏色說明
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption">時差小 (0-3小時)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '12px', height: '12px', backgroundColor: '#FFC107', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption">時差中等 (4-7小時)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '12px', height: '12px', backgroundColor: '#FF9800', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption">時差較大 (8-11小時)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '12px', height: '12px', backgroundColor: '#F44336', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption">時差極大 (12+小時)</Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom align="center" sx={{ mt: 2 }}>
                時間狀態說明
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WbSunnyIcon sx={{ fontSize: 16, color: '#FFC107', mr: 1 }} />
                  <Typography variant="caption">白天時間 (7:00-18:00)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NightsStayIcon sx={{ fontSize: 16, color: '#3f51b5', mr: 1 }} />
                  <Typography variant="caption">夜晚時間 (18:00-7:00)</Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                點擊時間線上的點或刻度可查看該時間的國家
              </Typography>
            </Paper>
          </Grid>
          
          {/* 右側國家時間對照表 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PublicIcon sx={{ mr: 0.5, fontSize: 16 }} />
                國家時間對照表 (按時差分組)
              </Typography>
              
              <Box sx={{ 
                maxHeight: '180px',
                overflowY: 'auto',
                pr: 1,
                mt: 1
              }}>
                {countryGroups.map((group, index) => {
                  const timeDiff = group.timeDiff;
                  return (
                    <Box key={`${index}-${timeDiff}`} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            bgcolor: getTimeDiffColor(timeDiff),
                            mr: 1
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          時差: {timeDiff > 0 ? '+' : ''}{timeDiff} 小時 
                          ({formatHour(group.localHour)})
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          {getLocalTimeStatus(group.localHour).icon}
                        </Box>
                        <Chip 
                          size="small" 
                          label={`${group.countries.length} 個國家`} 
                          sx={{ ml: 1, height: 20 }}
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        pl: 2
                      }}>
                        {group.countries.map(country => (
                          <Chip
                            key={country.code}
                            label={country.name}
                            size="small"
                            sx={{ 
                              backgroundColor: getTimeDiffColor(timeDiff),
                              color: Math.abs(timeDiff) > 11 ? 'white' : 'inherit',
                              height: 'auto',
                              '& .MuiChip-label': {
                                px: 1,
                                py: 0.3
                              }
                            }}
                          />
                        ))}
                      </Box>
                      
                      {index < countryGroups.length - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default TimelineChart;
