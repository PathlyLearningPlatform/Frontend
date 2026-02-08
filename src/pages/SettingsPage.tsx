import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LanguageIcon from '@mui/icons-material/Language'
import SecurityIcon from '@mui/icons-material/Security'
import { useThemeMode } from '../context/ThemeContext'

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useThemeMode()

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Ustawienia
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Dostosuj aplikację do swoich preferencji
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon><DarkModeIcon /></ListItemIcon>
            <ListItemText primary="Tryb ciemny" secondary="Przełącz na ciemny motyw" />
            <Switch checked={darkMode} onChange={toggleDarkMode} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText primary="Powiadomienia" secondary="Otrzymuj powiadomienia o nowych ścieżkach" />
            <Switch disabled />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><LanguageIcon /></ListItemIcon>
            <ListItemText primary="Język" secondary="Polski" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon><SecurityIcon /></ListItemIcon>
            <ListItemText primary="Prywatność" secondary="Zarządzaj ustawieniami prywatności" />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Pozostałe ustawienia zostaną aktywowane po podpięciu systemu użytkowników z backendu.
        </Typography>
      </Box>
    </>
  )
}
