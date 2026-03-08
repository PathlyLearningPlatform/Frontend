import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function ProfilePage() {
  const { authenticated, user, login, logout } = useAuth()
  const { t } = useLanguage()

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t('profile.title')}
      </Typography>

      <Paper
        sx={{
          p: 4,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #6C63FF, #00D2FF)',
          }}
        />
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: authenticated
              ? 'linear-gradient(135deg, #6C63FF, #FF6584)'
              : 'linear-gradient(135deg, #9898B0, #5E5E7A)',
            fontSize: 32,
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(108, 99, 255, 0.25)',
          }}
        >
          {authenticated && user
            ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
            : <PersonIcon sx={{ fontSize: 40 }} />
          }
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={700}>
              {authenticated && user
                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username
                : t('auth.user')
              }
            </Typography>
            {authenticated && (
              <Chip
                label="Online"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  background: 'linear-gradient(135deg, #36D399, #22B573)',
                  color: 'white',
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {authenticated && user ? user.email : t('auth.notLoggedIn')}
          </Typography>
        </Box>
        {authenticated ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ borderRadius: 2.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            {t('auth.logout')}
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={login}
            sx={{ borderRadius: 2.5 }}
          >
            {t('auth.login')}
          </Button>
        )}
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemText primary={t('profile.username')} secondary={authenticated && user ? user.username : '—'} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary={t('profile.email')} secondary={authenticated && user ? user.email : '—'} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary={t('profile.firstName')} secondary={authenticated && user ? user.firstName || '—' : '—'} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary={t('profile.lastName')} secondary={authenticated && user ? user.lastName || '—' : '—'} />
          </ListItem>
        </List>
      </Paper>
    </>
  )
}
