import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Map, Overlay, ZoomControl } from 'pigeon-maps';
import { Box, Paper, Typography, Chip, Divider, Grid, Tooltip as MuiTooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { Country } from '../types/index';
import { calculateTimeDifference, formatTime } from '../utils/timezoneUtils';

interface WorldMapProps {
  userTimeZone: string;
  filteredCountries: Country[];
  allCountries: Country[];
}

const WorldMap: React.FC<WorldMapProps> = ({ userTimeZone, filteredCountries, allCountries }) => {
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    code: string;
    position: [number, number];
    timeDiff: number;
    capital: string;
    timezone: string;
  } | null>(null);
  
  // 添加一個狀態來跟踪當前懸停的國家ID，避免重複設置
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(1.8);
  
  // 引入一個鎖定狀態，防止快速變更
  const [isLocked, setIsLocked] = useState(false);
  
  // 使用ref來跟踪當前懸停的國家元素
  const currentHoverRef = useRef<string | null>(null);
  
  // 新增 ref 來追踪鼠標是否在 tooltip 上
  const isOnTooltipRef = useRef<boolean>(false);

  // 獲取時差狀態顏色和標籤
  const getTimeDiffStatus = (timeDiff: number): { color: string; label: string } => {
    // 使用時差的絕對值來決定顏色
    const absDiff = Math.abs(timeDiff);
    
    if (absDiff <= 3) {
      return { color: '#4CAF50', label: '時差小 (0-3小時)' }; // 綠色 - 時差小
    } else if (absDiff <= 7) {
      return { color: '#FFC107', label: '時差中等 (4-7小時)' }; // 黃色 - 時差中等
    } else if (absDiff <= 11) {
      return { color: '#FF9800', label: '時差較大 (8-11小時)' }; // 橙色 - 時差較大
    } else {
      return { color: '#F44336', label: '時差極大 (12+小時)' }; // 紅色 - 時差極大
    }
  };
  
  // 獲取當地時間狀態
  const getLocalTimeStatus = (timeDiff: number): { icon: React.ReactNode; label: string } => {
    const now = new Date();
    const localHour = (now.getHours() + timeDiff + 24) % 24;
    
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

  // 創建一個國家代碼到顏色的映射 - 基於時差大小
  const countryColorMap: Record<string, string> = {};
  filteredCountries.forEach(country => {
    const timeDiff = calculateTimeDifference(country.code, userTimeZone);
    countryColorMap[country.code] = getTimeDiffStatus(timeDiff).color;
  });

  // 使用 useRef 和 useCallback 來實現更穩定的防抖
  const hoverTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);
  // 新增一個鎖定超時引用
  const lockTimeoutRef = useRef<number | null>(null);

  // 清除所有計時器的輔助函數
  const clearAllTimeouts = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (leaveTimeoutRef.current !== null) {
      window.clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    if (lockTimeoutRef.current !== null) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
  }, []);

  // 關閉tooltip並解鎖的輔助函數
  const closeTooltipAndUnlock = useCallback(() => {
    setHoveredCountry(null);
    setHoveredCountryId(null);
    setIsLocked(false);
    currentHoverRef.current = null;
  }, []);

  // 在組件卸載時清除所有計時器
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  const handleCountryHover = useCallback((country: Country) => {
    // 更新當前懸停的國家引用
    currentHoverRef.current = country.code;
    
    // 如果已經懸停在這個國家上或正在鎖定中，不做任何操作
    if (hoveredCountryId === country.code || isLocked) {
      return;
    }
    
    // 清除之前的計時器
    clearAllTimeouts();
    
    // 設置新的計時器，延遲顯示懸停信息
    hoverTimeoutRef.current = window.setTimeout(() => {
      // 再次檢查當前懸停的國家是否仍然是同一個
      if (currentHoverRef.current === country.code) {
        const timeDiff = calculateTimeDifference(country.code, userTimeZone);
        
        // 在更新懸停國家前先設置鎖定狀態
        setIsLocked(true);
        setHoveredCountryId(country.code);
        setHoveredCountry({
          name: country.name,
          code: country.code,
          position: country.latlng,
          timeDiff: timeDiff,
          capital: country.capital,
          timezone: country.timezones[0]
        });
        
        // 設置一個解鎖計時器
        lockTimeoutRef.current = window.setTimeout(() => {
          // 只有當鼠標不在tooltip上時才解鎖
          if (!isOnTooltipRef.current) {
            setIsLocked(false);
          }
          lockTimeoutRef.current = null;
        }, 300); // 鎖定300ms，防止立即被其他事件覆蓋
      }
      hoverTimeoutRef.current = null;
    }, 250); // 懸停250ms後才顯示信息
  }, [userTimeZone, hoveredCountryId, isLocked, clearAllTimeouts]);

  const handleCountryLeave = useCallback(() => {
    // 清除當前懸停國家引用
    currentHoverRef.current = null;
    
    // 如果正在鎖定中但鼠標不在tooltip上，才處理離開事件
    if (isLocked && !isOnTooltipRef.current) {
      // 清除之前的計時器
      clearAllTimeouts();
      
      // 設置新的計時器，延遲隱藏懸停信息
      leaveTimeoutRef.current = window.setTimeout(() => {
        // 再次檢查當前是否沒有懸停的國家且鼠標不在tooltip上
        if (!currentHoverRef.current && !isOnTooltipRef.current) {
          closeTooltipAndUnlock();
        }
        leaveTimeoutRef.current = null;
      }, 350); // 離開後350ms才隱藏信息
    } else if (!isLocked) {
      // 如果沒有鎖定，處理正常的離開事件
      clearAllTimeouts();
      
      leaveTimeoutRef.current = window.setTimeout(() => {
        if (!currentHoverRef.current && !isOnTooltipRef.current) {
          setHoveredCountry(null);
          setHoveredCountryId(null);
        }
        leaveTimeoutRef.current = null;
      }, 350);
    }
  }, [isLocked, clearAllTimeouts, closeTooltipAndUnlock]);

  // 處理tooltip的滑鼠進入
  const handleTooltipEnter = useCallback(() => {
    isOnTooltipRef.current = true;
    
    // 清除任何可能關閉tooltip的計時器
    if (leaveTimeoutRef.current !== null) {
      window.clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  // 處理tooltip的滑鼠離開
  const handleTooltipLeave = useCallback(() => {
    isOnTooltipRef.current = false;
    
    // 鼠標離開tooltip後，延遲關閉tooltip
    clearAllTimeouts();
    
    leaveTimeoutRef.current = window.setTimeout(() => {
      // 再次檢查當前是否沒有懸停的國家且鼠標不在tooltip上
      if (!currentHoverRef.current && !isOnTooltipRef.current) {
        closeTooltipAndUnlock();
      }
      leaveTimeoutRef.current = null;
    }, 350);
  }, [clearAllTimeouts, closeTooltipAndUnlock]);

  const handleCountryClick = (country: Country) => {
    // 點擊國家時，將地圖中心移動到該國家
    setMapCenter(country.latlng);
    setZoom(Math.max(zoom, 3)); // 放大到至少3級
    
    // 同時更新懸停國家，確保顯示信息
    const timeDiff = calculateTimeDifference(country.code, userTimeZone);
    setHoveredCountryId(country.code);
    setHoveredCountry({
      name: country.name,
      code: country.code,
      position: country.latlng,
      timeDiff: timeDiff,
      capital: country.capital,
      timezone: country.timezones[0]
    });
    
    // 點擊後鎖定信息顯示一段時間
    setIsLocked(true);
    clearAllTimeouts();
    lockTimeoutRef.current = window.setTimeout(() => {
      // 只有當鼠標不在tooltip上時才解鎖
      if (!isOnTooltipRef.current) {
        setIsLocked(false);
      }
      lockTimeoutRef.current = null;
    }, 800); // 點擊後鎖定更長時間
  };

  // 計算點的大小 - 根據是否在篩選結果中調整
  const getPointSize = (country: Country): number => {
    if (filteredCountries.some(c => c.code === country.code)) {
      return 20; // 符合條件的國家點更大
    }
    return 8; // 不符合條件的國家點更小
  };

  // 計算點的脈動動畫 - 只有符合條件的國家才有脈動效果
  const getPulseAnimation = (country: Country): string => {
    if (filteredCountries.some(c => c.code === country.code)) {
      return `
        @keyframes pulse-${country.code} {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
    }
    return '';
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* 地圖圖例 */}
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000, 
          p: 1, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          maxWidth: '220px'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          時差大小圖例
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50', mr: 1 }} />
            <Typography variant="caption">時差小 (0-3小時)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFC107', mr: 1 }} />
            <Typography variant="caption">時差中等 (4-7小時)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9800', mr: 1 }} />
            <Typography variant="caption">時差較大 (8-11小時)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F44336', mr: 1 }} />
            <Typography variant="caption">時差極大 (12+小時)</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
          符合條件的國家: {filteredCountries.length}
        </Typography>
      </Paper>

      <Map 
        center={mapCenter}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setMapCenter(center);
          setZoom(zoom);
        }}
        minZoom={1.5}
        maxZoom={8}
        metaWheelZoom={true}
        twoFingerDrag={true}
      >
        <ZoomControl 
          buttonStyle={{
            display:'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
        
        {allCountries.map(country => {
          const isFiltered = filteredCountries.some(c => c.code === country.code);
          const pointSize = getPointSize(country);
          const pulseAnimation = getPulseAnimation(country);
          
          return (
            <Overlay 
              key={country.code}
              anchor={country.latlng} 
              offset={[0, 0]}
            >
              <MuiTooltip 
                title={`${country.name} (${country.code})`}
                placement="top"
                arrow
                enterDelay={300}
                leaveDelay={100}
              >
                <div
                  style={{
                    position: 'relative',
                    width: `${pointSize + 10}px`, // 擴大點擊區域
                    height: `${pointSize + 10}px`, // 擴大點擊區域
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => handleCountryHover(country)}
                  onMouseLeave={handleCountryLeave}
                  onClick={() => handleCountryClick(country)}
                >
                  <div
                    style={{
                      width: `${pointSize}px`,
                      height: `${pointSize}px`,
                      borderRadius: '50%',
                      backgroundColor: countryColorMap[country.code] || 'rgba(204, 204, 204, 0.5)',
                      border: isFiltered ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: isFiltered ? '0 0 8px rgba(0, 0, 0, 0.5)' : 'none',
                      transition: 'all 0.3s ease-in-out',
                      opacity: isFiltered ? 1 : 0.5,
                      transform: `scale(${isFiltered ? 1 : 0.8})`,
                      animation: isFiltered ? `pulse-${country.code} 2s infinite` : 'none',
                    }}
                  />
                </div>
              </MuiTooltip>
              <style>
                {pulseAnimation}
              </style>
            </Overlay>
          );
        })}

        {hoveredCountry && (
          <Overlay 
            anchor={hoveredCountry.position} 
            offset={[120, 60]}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                maxWidth: '250px', 
                borderLeft: `4px solid ${getTimeDiffStatus(hoveredCountry.timeDiff).color}`,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(5px)',
                // 移除了 pointerEvents: 'none'，讓 tooltip 可以接收鼠標事件
              }}
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <PublicIcon sx={{ mr: 1, fontSize: 20 }} />
                {hoveredCountry.name} ({hoveredCountry.code})
              </Typography>
              
              {hoveredCountry.capital && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  首都: {hoveredCountry.capital}
                </Typography>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AccessTimeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      時差:
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${hoveredCountry.timeDiff > 0 ? '+' : ''}${hoveredCountry.timeDiff} 小時`} 
                      color={Math.abs(hoveredCountry.timeDiff) <= 3 ? "success" : Math.abs(hoveredCountry.timeDiff) <= 7 ? "warning" : "error"}
                      sx={{ height: 20 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2">
                    時區: {hoveredCountry.timezone}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: getTimeDiffStatus(hoveredCountry.timeDiff).color,
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {getTimeDiffStatus(hoveredCountry.timeDiff).label}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getLocalTimeStatus(hoveredCountry.timeDiff).icon}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      當地時間: {formatTime(new Date(new Date().getTime() + hoveredCountry.timeDiff * 60 * 60 * 1000), hoveredCountry.timezone)}
                      ({getLocalTimeStatus(hoveredCountry.timeDiff).label})
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              {filteredCountries.some(c => c.code === hoveredCountry.code) ? (
                <Chip 
                  size="small" 
                  label="符合篩選條件" 
                  color="success" 
                  sx={{ mt: 0.5, height: 24 }}
                />
              ) : (
                <Chip 
                  size="small" 
                  label="不符合篩選條件" 
                  color="default" 
                  variant="outlined"
                  sx={{ mt: 0.5, height: 24 }}
                />
              )}
            </Paper>
          </Overlay>
        )}
      </Map>
    </Box>
  );
};

export default WorldMap;
