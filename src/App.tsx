import React, { useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  CssBaseline,
  ThemeProvider,
  createTheme,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
  useMediaQuery,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import PublicIcon from "@mui/icons-material/Public";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TimelineIcon from "@mui/icons-material/Timeline";
import SettingsIcon from "@mui/icons-material/Settings";
import Header from "./components/Header";
import TimeZoneSelector from "./components/TimeZoneSelector";
import TimeInputs from "./components/TimeInputs";
import WorldMap from "./components/WorldMap";
import CountryList from "./components/CountryList";
import TimelineChart from "./components/TimelineChart";
import { useTimezones } from "./hooks/useTimezones";

// 創建主題
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
        },
      },
    },
  },
});

// 標籤頁類型
type TabValue = "map" | "list" | "timeline" | "settings";

function App() {
  // 在移動設備上使用標籤頁導航
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState<TabValue>("map");

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };
  const {
    userTimeZone,
    setUserTimeZone,
    workTime,
    setWorkTime,
    wakeTime,
    setWakeTime,
    timeZoneOptions,
    filteredCountries,
    allCountries,
    useTimeRange,
    setUseTimeRange,
    timeZoneRange,
    setTimeZoneRange,
  } = useTimezones();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          maxWidth: "1200px",
          mx: "auto",
          px: 2,
        }}
      >
        <Header />

        {/* 主要內容區域 */}
        <Container
          sx={{
            mt: 3,
            mb: 3,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            maxWidth: "1000px",
            mx: "auto",
          }}
        >
          {/* 頂部控制面板 */}
          <Paper
            elevation={3}
            sx={{ p: 3, mb: 3, borderRadius: 2, width: "100%" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
              >
                尋找指定時差範圍的國家
              </Typography>
              <Tooltip title="選擇您的時區並設定時差範圍，找到適合您工作或交流的國家">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TimeZoneSelector
                  value={userTimeZone}
                  onChange={setUserTimeZone}
                  options={timeZoneOptions}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useTimeRange}
                        onChange={(e) => setUseTimeRange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        使用時差範圍篩選
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {useTimeRange ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      時差範圍: {timeZoneRange.minOffset > 0 ? "+" : ""}
                      {timeZoneRange.minOffset} 到
                      {timeZoneRange.maxOffset > 0 ? "+" : ""}
                      {timeZoneRange.maxOffset} 小時
                    </Typography>
                    <Slider
                      value={[timeZoneRange.minOffset, timeZoneRange.maxOffset]}
                      onChange={(_, newValue) =>
                        setTimeZoneRange({
                          minOffset: (newValue as number[])[0],
                          maxOffset: (newValue as number[])[1],
                        })
                      }
                      valueLabelDisplay="auto"
                      min={-12}
                      max={12}
                      marks={[
                        { value: -12, label: "-12" },
                        { value: -6, label: "-6" },
                        { value: 0, label: "0" },
                        { value: 6, label: "+6" },
                        { value: 12, label: "+12" },
                      ]}
                      sx={{
                        "& .MuiSlider-valueLabel": {
                          backgroundColor: theme.palette.primary.main,
                        },
                        "& .MuiSlider-markLabel": {
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <TimeInputs
                    workTime={workTime}
                    wakeTime={wakeTime}
                    onWorkTimeChange={setWorkTime}
                    onWakeTimeChange={setWakeTime}
                  />
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* 移動設備標籤頁導航 */}
          {isMobile && (
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="navigation tabs"
              >
                <Tab icon={<PublicIcon />} label="地圖" value="map" />
                <Tab
                  icon={<FormatListBulletedIcon />}
                  label="國家列表"
                  value="list"
                />
                {!useTimeRange && (
                  <Tab
                    icon={<TimelineIcon />}
                    label="時間線"
                    value="timeline"
                  />
                )}
                <Tab icon={<SettingsIcon />} label="設置" value="settings" />
              </Tabs>
            </Paper>
          )}

          {/* 主要內容區域 */}
          {(!isMobile || activeTab === "map" || activeTab === "list") && (
            <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
              {/* 左側地圖 */}
              {(!isMobile || activeTab === "map") && (
                <Grid item xs={12} md={7} sx={{ display: "flex" }}>
                  <Paper
                    elevation={3}
                    sx={{
                      height: isMobile ? "calc(100vh - 300px)" : "100%",
                      p: 0,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <PublicIcon
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        世界地圖視圖
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, p: 2, overflow: "hidden" }}>
                      <WorldMap
                        userTimeZone={userTimeZone}
                        filteredCountries={filteredCountries}
                        allCountries={allCountries}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* 右側國家列表 */}
              {(!isMobile || activeTab === "list") && (
                <Grid item xs={12} md={5} sx={{ display: "flex" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <CountryList
                      userTimeZone={userTimeZone}
                      filteredCountries={filteredCountries}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* 底部時間線圖表 */}
          {!useTimeRange && (!isMobile || activeTab === "timeline") && (
            <Paper elevation={3} sx={{ p: 0, mb: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TimelineIcon
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                  時間線視圖
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <TimelineChart
                  userTimeZone={userTimeZone}
                  filteredCountries={filteredCountries}
                  workTime={workTime}
                />
              </Box>
            </Paper>
          )}

          {/* 設置頁面 - 僅在移動設備的設置標籤頁顯示 */}
          {isMobile && activeTab === "settings" && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "medium",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SettingsIcon sx={{ mr: 1 }} />
                時區設置
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TimeZoneSelector
                    value={userTimeZone}
                    onChange={setUserTimeZone}
                    options={timeZoneOptions}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useTimeRange}
                          onChange={(e) => setUseTimeRange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="使用時差範圍篩選"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  {useTimeRange ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      }}
                    >
                      <Typography gutterBottom>
                        時差範圍: {timeZoneRange.minOffset > 0 ? "+" : ""}
                        {timeZoneRange.minOffset} 到
                        {timeZoneRange.maxOffset > 0 ? "+" : ""}
                        {timeZoneRange.maxOffset} 小時
                      </Typography>
                      <Slider
                        value={[
                          timeZoneRange.minOffset,
                          timeZoneRange.maxOffset,
                        ]}
                        onChange={(_, newValue) =>
                          setTimeZoneRange({
                            minOffset: (newValue as number[])[0],
                            maxOffset: (newValue as number[])[1],
                          })
                        }
                        valueLabelDisplay="auto"
                        min={-12}
                        max={12}
                        marks={[
                          { value: -12, label: "-12" },
                          { value: -6, label: "-6" },
                          { value: 0, label: "0" },
                          { value: 6, label: "+6" },
                          { value: 12, label: "+12" },
                        ]}
                      />
                    </Box>
                  ) : (
                    <TimeInputs
                      workTime={workTime}
                      wakeTime={wakeTime}
                      onWorkTimeChange={setWorkTime}
                      onWakeTimeChange={setWakeTime}
                    />
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
