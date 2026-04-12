import { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import RouteIcon from '@mui/icons-material/Route'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useThemeMode } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const DRAWER_WIDTH = 270

const mainMenuKeys = [
  { key: 'nav.dashboard' as const, icon: <HomeIcon />, path: '/' },
  { key: 'nav.explore' as const, icon: <RouteIcon />, path: '/explore' },
  { key: 'nav.myPaths' as const, icon: <SchoolIcon />, path: '/my-paths' },
  { key: 'nav.progress' as const, icon: <TrendingUpIcon />, path: '/progress' },
]

const bottomMenuKeys = [
  { key: 'nav.profile' as const, icon: <PersonIcon />, path: '/profile' },
  { key: 'nav.settings' as const, icon: <SettingsIcon />, path: '/settings' },
]


export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useThemeMode()
  const { authenticated, user, login, logout } = useAuth()
  const { t } = useLanguage()

  const userInitials = authenticated && user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
    : 'U'

  const userName = authenticated && user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username
    : t('auth.user')

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        background: darkMode
          ? 'rgba(12, 12, 22, 0.55)'
          : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: darkMode
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.4)',
        // Subtle gradient accent on the right edge
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 0,
          top: '15%',
          width: '1px',
          height: '70%',
          background: 'linear-gradient(180deg, transparent, rgba(108,99,255,0.3), rgba(0,210,255,0.2), transparent)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 50%, #00D2FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(108, 99, 255, 0.4)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'rotate(-8deg) scale(1.1)' },
          }}
        >
          <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF, #00D2FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Pathly
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1, mt: -0.3, display: 'block' }}>
            Learning Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* New path button */}
      {/*<Box sx={{ px: 2, pt: 2.5, pb: 1 }}>
        <ListItemButton
          sx={{
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
            color: 'white',
            py: 1.2,
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5B53EE 0%, #8480EE 100%)',
              boxShadow: '0 8px 28px rgba(108, 99, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
            mb: 1,
          }}
          onClick={() => navigate('/learning-paths/new')}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <AddCircleOutlineIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.newPath')} primaryTypographyProps={{ fontWeight: 700 }} />
        </ListItemButton>
      </Box>*/}

      {/* Section label */}
      <Typography
        variant="overline"
        sx={{ px: 3, pt: 1.5, pb: 0.5, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.1em' }}
      >
        {t('nav.menu')}
      </Typography>

      {/* Main menu */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {mainMenuKeys.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1,
                position: 'relative',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': isActive ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '60%',
                  borderRadius: '0 4px 4px 0',
                  background: 'linear-gradient(180deg, #6C63FF, #00D2FF)',
                } : {},
                '&.Mui-selected': {
                  bgcolor: darkMode ? 'rgba(108, 99, 255, 0.15)' : 'rgba(108, 99, 255, 0.08)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(108, 99, 255, 0.2)' : 'rgba(108, 99, 255, 0.12)',
                  },
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(108, 99, 255, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={t(item.key)}
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Dark mode toggle */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Tooltip title={darkMode ? t('nav.switchToLight') : t('nav.switchToDark')} placement="right">
          <ListItemButton
            onClick={toggleDarkMode}
            sx={{
              borderRadius: 2.5,
              py: 1,
              transition: 'all 0.25s',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(108, 99, 255, 0.04)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {darkMode ? <LightModeIcon sx={{ color: '#FFB74D' }} /> : <DarkModeIcon sx={{ color: '#5E5E7A' }} />}
            </ListItemIcon>
            <ListItemText
              primary={darkMode ? t('nav.lightTheme') : t('nav.darkTheme')}
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Bottom menu */}
      <Typography
        variant="overline"
        sx={{ px: 3, pt: 1.5, pb: 0.5, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.1em' }}
      >
        {t('nav.account')}
      </Typography>
      <List sx={{ px: 1.5 }}>
        {bottomMenuKeys.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  bgcolor: darkMode ? 'rgba(108, 99, 255, 0.15)' : 'rgba(108, 99, 255, 0.08)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(108, 99, 255, 0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={t(item.key)}
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
              />
            </ListItemButton>
          )
        })}
      </List>

      {/* User avatar / Auth */}
      <Divider sx={{ mx: 2, opacity: 0.3 }} />
      {authenticated ? (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mx: 1,
            my: 1,
            borderRadius: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              fontSize: 15,
              fontWeight: 700,
              boxShadow: '0 3px 12px rgba(108, 99, 255, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.1)' },
            }}
            onClick={() => navigate('/profile')}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} fontSize="0.85rem" noWrap>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title={t('auth.logout')}>
            <IconButton
              size="small"
              onClick={logout}
              sx={{
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': { color: 'error.main', transform: 'scale(1.1)' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ p: 2, mx: 1, my: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={login}
            sx={{
              borderRadius: 2.5,
              py: 1,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2, transform: 'translateY(-1px)' },
            }}
          >
            {t('auth.login')}
          </Button>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { md: 'none' },
          bgcolor: darkMode ? 'rgba(12, 12, 22, 0.85)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF, #00D2FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pathly
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            border: 'none',
            background: 'transparent',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            border: 'none',
            background: 'transparent',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          mt: { xs: 8, md: 0 },
          ml: { md: `${DRAWER_WIDTH}px` },
          maxWidth: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  )
}
