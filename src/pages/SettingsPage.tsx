import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LanguageIcon from '@mui/icons-material/Language'
import SecurityIcon from '@mui/icons-material/Security'
import { useThemeMode } from '../context/ThemeContext'
import { useLanguage, type Language } from '../context/LanguageContext'

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useThemeMode()
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t('settings.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {language === 'pl' ? 'Dostosuj aplikację do swoich preferencji' : 'Customize the app to your preferences'}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon><DarkModeIcon /></ListItemIcon>
            <ListItemText
              primary={t('settings.darkMode')}
              secondary={language === 'pl' ? 'Przełącz na ciemny motyw' : 'Switch to dark theme'}
            />
            <Switch checked={darkMode} onChange={toggleDarkMode} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><LanguageIcon /></ListItemIcon>
            <ListItemText
              primary={t('settings.language')}
              secondary={language === 'pl' ? 'Wybierz język interfejsu' : 'Choose interface language'}
            />
            <ToggleButtonGroup
              value={language}
              exclusive
              onChange={(_e, val: Language | null) => {
                if (val) setLanguage(val)
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                },
              }}
            >
              <ToggleButton value="pl">{t('settings.polish')}</ToggleButton>
              <ToggleButton value="en">{t('settings.english')}</ToggleButton>
            </ToggleButtonGroup>
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText
              primary={language === 'pl' ? 'Powiadomienia' : 'Notifications'}
              secondary={language === 'pl' ? 'Otrzymuj powiadomienia o nowych ścieżkach' : 'Receive notifications about new paths'}
            />
            <Switch disabled />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><SecurityIcon /></ListItemIcon>
            <ListItemText
              primary={language === 'pl' ? 'Prywatność' : 'Privacy'}
              secondary={language === 'pl' ? 'Zarządzaj ustawieniami prywatności' : 'Manage privacy settings'}
            />
          </ListItem>
        </List>
      </Paper>
    </>
  )
}
