import React, { useState } from 'react';
import { 
  Grid, 
  TextField, 
  Box, 
  Typography, 
  Tooltip, 
  IconButton, 
  Paper, 
  Slider, 
  Chip,
  Collapse,
  Divider
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import BedtimeIcon from '@mui/icons-material/Bedtime';

interface TimeInputsProps {
  workTime: string;
  wakeTime: string;
  onWorkTimeChange: (value: string) => void;
  onWakeTimeChange: (value: string) => void;
}

const TimeInputs: React.FC<TimeInputsProps> = ({
  workTime,
  wakeTime,
  onWorkTimeChange,
  onWakeTimeChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 將時間字符串轉換為小時數（用於滑塊）
  const timeToHours = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };
  
  // 將小時數轉換為時間字符串（用於滑塊）
  const hoursToTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  // 工作時間滑塊值
  const workHours = timeToHours(workTime);
  
  // 起床時間滑塊值
  const wakeHours = timeToHours(wakeTime);
  
  // 處理工作時間滑塊變化
  const handleWorkSliderChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onWorkTimeChange(hoursToTime(newValue));
    }
  };
  
  // 處理起床時間滑塊變化
  const handleWakeSliderChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onWakeTimeChange(hoursToTime(newValue));
    }
  };
  
  // 獲取時間標籤
  const getTimeLabel = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const period = h >= 12 ? '下午' : '上午';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${period} ${hour12}:${m.toString().padStart(2, '0')}`;
  };
  
  // 獲取時間段描述
  const getTimeDescription = (hours: number): string => {
    if (hours >= 5 && hours < 9) return '早晨';
    if (hours >= 9 && hours < 12) return '上午';
    if (hours >= 12 && hours < 14) return '中午';
    if (hours >= 14 && hours < 18) return '下午';
    if (hours >= 18 && hours < 22) return '晚上';
    return '深夜';
  };
  
  // 獲取時間段顏色
  const getTimeColor = (hours: number): string => {
    if (hours >= 9 && hours < 18) return '#4CAF50'; // 工作時間 - 綠色
    if (hours >= 7 && hours < 23) return '#FFC107'; // 清醒時間 - 黃色
    return '#F44336'; // 夜間時間 - 紅色
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            時間設定
          </Typography>
          <Typography variant="body2" color="text.secondary">
            設定您的工作和起床時間，我們將找出與您時間相符的國家
          </Typography>
        </Box>
        <Tooltip 
          title="我們會尋找在您工作時間也是工作時間（9:00-18:00）的國家，並確保目標國家的當地時間不早於您設定的起床時間"
          arrow
          placement="left"
        >
          <IconButton size="small">
            <InfoIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* 工作時間輸入 */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">您的上班時間（目前時區）</Typography>
              <Chip 
                size="small" 
                label={getTimeDescription(workHours)} 
                sx={{ 
                  ml: 1, 
                  backgroundColor: getTimeColor(workHours),
                  color: workHours >= 23 || workHours < 7 ? 'white' : 'inherit'
                }} 
              />
            </Box>
            
            <TextField
              fullWidth
              type="time"
              value={workTime}
              onChange={(e) => onWorkTimeChange(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{
                step: 300, // 5 min
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Box>
        </Grid>
        
        {/* 起床時間輸入 */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WbSunnyIcon sx={{ color: '#FFC107', mr: 1 }} />
              <Typography variant="subtitle2">最早可接受的當地起床時間</Typography>
              <Chip 
                size="small" 
                label={getTimeDescription(wakeHours)} 
                sx={{ 
                  ml: 1, 
                  backgroundColor: getTimeColor(wakeHours),
                  color: wakeHours >= 23 || wakeHours < 7 ? 'white' : 'inherit'
                }} 
              />
            </Box>
            
            <TextField
              fullWidth
              type="time"
              value={wakeTime}
              onChange={(e) => onWakeTimeChange(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{
                step: 300, // 5 min
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
              此時間是指目標國家的當地時間，而非您所在時區的時間
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* 顯示/隱藏高級選項按鈕 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      {/* 高級選項 - 滑塊 */}
      <Collapse in={showAdvanced}>
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }}>
            <Chip label="時間滑塊調整" size="small" />
          </Divider>
          
          <Grid container spacing={4}>
            {/* 工作時間滑塊 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">上班時間: {getTimeLabel(workHours)}</Typography>
                </Box>
                
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={workHours}
                    onChange={handleWorkSliderChange}
                    min={0}
                    max={23.75}
                    step={0.25}
                    marks={[
                      { value: 9, label: '9:00' },
                      { value: 12, label: '12:00' },
                      { value: 18, label: '18:00' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => hoursToTime(value)}
                    sx={{
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(to right, #FFC107, #4CAF50, #FFC107, #F44336)',
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 1,
                  px: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WbSunnyIcon sx={{ color: '#FFC107', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">早晨</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ color: '#4CAF50', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">工作</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NightsStayIcon sx={{ color: '#F44336', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">夜間</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            {/* 起床時間滑塊 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BedtimeIcon sx={{ color: '#FFC107', fontSize: 'small', mr: 1 }} />
                  <Typography variant="body2">當地起床時間: {getTimeLabel(wakeHours)}</Typography>
                </Box>
                
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={wakeHours}
                    onChange={handleWakeSliderChange}
                    min={0}
                    max={23.75}
                    step={0.25}
                    marks={[
                      { value: 5, label: '5:00' },
                      { value: 7, label: '7:00' },
                      { value: 9, label: '9:00' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => hoursToTime(value)}
                    sx={{
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(to right, #F44336, #FFC107, #4CAF50)',
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 1,
                  px: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NightsStayIcon sx={{ color: '#F44336', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">深夜</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WbSunnyIcon sx={{ color: '#FFC107', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">早晨</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ color: '#4CAF50', fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption">上午</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              提示：使用滑塊可以更直觀地調整時間，或直接在上方的時間輸入框中輸入精確時間
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TimeInputs;
