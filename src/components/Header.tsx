import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Chip, 
  Tooltip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Link
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode = false, onToggleDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 格式化當前時間
  const formattedTime = currentTime.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // 獲取當前時區
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -currentTime.getTimezoneOffset() / 60;
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
  
  // 獲取當前日期
  const formattedDate = currentTime.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  // 對話框狀態
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);
  
  // 處理菜單開關
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // 處理對話框開關
  const handleAboutDialogOpen = () => {
    setAboutDialogOpen(true);
    handleMenuClose();
  };
  
  const handleAboutDialogClose = () => {
    setAboutDialogOpen(false);
  };
  
  const handleHelpDialogOpen = () => {
    setHelpDialogOpen(true);
    handleMenuClose();
  };
  
  const handleHelpDialogClose = () => {
    setHelpDialogOpen(false);
  };
  
  // 處理幫助項目展開/收起
  const handleHelpItemToggle = (item: string) => {
    if (expandedHelp === item) {
      setExpandedHelp(null);
    } else {
      setExpandedHelp(item);
    }
  };
  
  // 處理暗黑模式切換
  const handleDarkModeToggle = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    }
    handleMenuClose();
  };
  

  return (
    <AppBar position="static" sx={{ 
      background: darkMode 
        ? 'linear-gradient(90deg, #1a237e 0%, #283593 100%)' 
        : 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      <Container>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          {/* 左側標題 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                mr: 2, 
                bgcolor: 'transparent',
                width: 40,
                height: 40,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              <PublicIcon sx={{ fontSize: 28, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                下一站旅居去哪裡？
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.9, 
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 'medium',
                  letterSpacing: 0.5
                }}
              >
                尋找指定時差範圍的國家
              </Typography>
            </Box>
          </Box>
          
          {/* 右側時間和時區信息 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Tooltip title={formattedDate} arrow>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: 2, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1
                }}>
                  <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                    {formattedTime}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            
            <Tooltip 
              title={
                <React.Fragment>
                  <Typography variant="body2">您的本地時區</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    用於計算與其他國家的時差
                  </Typography>
                </React.Fragment>
              } 
              arrow
            >
              <Chip 
                icon={<ScheduleIcon />} 
                label={`${timeZone} (UTC${offsetStr})`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontWeight: 'medium'
                }}
              />
            </Tooltip>
            
            {/* 更多選項按鈕 */}
            <IconButton 
              color="inherit" 
              sx={{ ml: 1 }}
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            
            {/* 下拉菜單 */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 2,
                  minWidth: 200,
                  mt: 1
                }
              }}
            >
              <MenuItem onClick={handleAboutDialogOpen}>
                <ListItemIcon>
                  <InfoOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="關於此工具" />
              </MenuItem>
              <MenuItem onClick={handleHelpDialogOpen}>
                <ListItemIcon>
                  <HelpOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="使用說明" />
              </MenuItem>
              {onToggleDarkMode && (
                <MenuItem onClick={handleDarkModeToggle}>
                  <ListItemIcon>
                    {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={darkMode ? "切換到亮色模式" : "切換到暗色模式"} />
                </MenuItem>
              )}
              <Divider />
            </Menu>
            
            {/* 關於對話框 */}
            <Dialog
              open={aboutDialogOpen}
              onClose={handleAboutDialogClose}
              aria-labelledby="about-dialog-title"
              PaperProps={{
                elevation: 5,
                sx: { borderRadius: 2 }
              }}
            >
              <DialogTitle id="about-dialog-title" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}>
                <PublicIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                關於時區查詢工具
              </DialogTitle>
              <DialogContent>
                <DialogContentText component="div">
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      版本 1.0.0
                    </Typography>
                    <Typography variant="body2" paragraph>
                      時區查詢工具是一個幫助用戶尋找特定時差範圍內國家的應用程序。無論您是需要安排跨時區會議、尋找合適的工作時間重疊，還是計劃國際旅行，本工具都能幫助您快速找到符合時差要求的國家。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      主要功能：
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <TravelExploreIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="按時差範圍篩選國家" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WatchLaterIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="查看各國當前時間和工作時間狀態" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LanguageIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="世界地圖視圖直觀顯示時差" />
                      </ListItem>
                    </List>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontStyle: 'italic'
                    }}>
                      © 2025 Waiting 
                      <Link
                        underline="none"
                        sx={{ color: 'blue.80', margin: '0 3px' }}
                        href="https://www.instagram.com/sheroontheway/"
                        target="_blank"
                        rel="noopener"
                      >
                      @sheroontheway
                      </Link>
                    </Typography>
                  </Box>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleAboutDialogClose} color="primary">
                  關閉
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* 使用說明對話框 */}
            <Dialog
              open={helpDialogOpen}
              onClose={handleHelpDialogClose}
              aria-labelledby="help-dialog-title"
              maxWidth="md"
              PaperProps={{
                elevation: 5,
                sx: { borderRadius: 2 }
              }}
            >
              <DialogTitle id="help-dialog-title" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}>
                <HelpOutlineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                使用說明
              </DialogTitle>
              <DialogContent>
                <List>
                  {/* 時區選擇說明 */}
                  <ListItemButton 
                    onClick={() => handleHelpItemToggle('timezone')}
                    sx={{ 
                      bgcolor: expandedHelp === 'timezone' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <ScheduleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="如何選擇時區" />
                    {expandedHelp === 'timezone' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedHelp === 'timezone'} timeout="auto" unmountOnExit>
                    <Paper variant="outlined" sx={{ m: 1, p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        1. 在頁面頂部的控制面板中，找到「時區選擇」下拉框。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. 點擊下拉框，會顯示所有可用的時區列表。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. 您可以通過搜索框快速查找特定時區，或者瀏覽按地區分組的時區列表。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        4. 選擇您所在的時區或您想要作為參考的時區。
                      </Typography>
                      <Typography variant="body2">
                        5. 系統會自動根據選擇的時區重新計算所有國家的時差。
                      </Typography>
                    </Paper>
                  </Collapse>
                  
                  {/* 時差範圍篩選說明 */}
                  <ListItemButton 
                    onClick={() => handleHelpItemToggle('timerange')}
                    sx={{ 
                      bgcolor: expandedHelp === 'timerange' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <AccessTimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="如何使用時差範圍篩選" />
                    {expandedHelp === 'timerange' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedHelp === 'timerange'} timeout="auto" unmountOnExit>
                    <Paper variant="outlined" sx={{ m: 1, p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        1. 在控制面板中，找到「使用時差範圍篩選」開關並打開它。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. 使用滑塊設置您想要查找的時差範圍，例如 -2 到 +3 小時。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. 系統會自動篩選出時差在指定範圍內的國家。
                      </Typography>
                      <Typography variant="body2">
                        4. 您可以隨時調整滑塊來擴大或縮小搜索範圍。
                      </Typography>
                    </Paper>
                  </Collapse>
                  
                  {/* 國家列表說明 */}
                  <ListItemButton 
                    onClick={() => handleHelpItemToggle('countrylist')}
                    sx={{ 
                      bgcolor: expandedHelp === 'countrylist' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <FormatListBulletedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="如何使用國家列表" />
                    {expandedHelp === 'countrylist' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedHelp === 'countrylist'} timeout="auto" unmountOnExit>
                    <Paper variant="outlined" sx={{ m: 1, p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        1. 國家列表顯示了符合您篩選條件的所有國家。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. 您可以使用搜索框搜索特定國家或首都。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. 點擊排序下拉框可以按不同條件排序國家列表。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        4. 點擊任何國家行可以展開查看更多詳細信息。
                      </Typography>
                      <Typography variant="body2">
                        5. 使用頁面底部的分頁控制瀏覽更多國家。
                      </Typography>
                    </Paper>
                  </Collapse>
                  
                  {/* 移動設備使用說明 */}
                  <ListItemButton 
                    onClick={() => handleHelpItemToggle('mobile')}
                    sx={{ 
                      bgcolor: expandedHelp === 'mobile' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      <PublicIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="在移動設備上使用" />
                    {expandedHelp === 'mobile' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedHelp === 'mobile'} timeout="auto" unmountOnExit>
                    <Paper variant="outlined" sx={{ m: 1, p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        1. 在移動設備上，界面會自動調整為更適合小屏幕的布局。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. 使用底部的標籤頁在地圖、國家列表和設置之間切換。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. 在設置標籤頁中可以調整時區和時差範圍。
                      </Typography>
                      <Typography variant="body2">
                        4. 所有功能在移動設備上都可用，只是布局有所不同。
                      </Typography>
                    </Paper>
                  </Collapse>
                </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleHelpDialogClose} color="primary">
                  關閉
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Toolbar>
        
        {/* 移動端顯示時間 */}
        {isMobile && (
          <Box sx={{ 
            pb: 1, 
            display: 'flex', 
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 4px 4px',
            py: 0.5
          }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 0.5, fontSize: 14 }} />
              {formattedDate} {formattedTime}
            </Typography>
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Header;
