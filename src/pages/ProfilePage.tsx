import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import PersonIcon from '@mui/icons-material/Person'

export default function ProfilePage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>

      <Paper sx={{ p: 4, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
          <PersonIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Użytkownik</Typography>
          <Typography variant="body2" color="text.secondary">
            Nie zalogowano
          </Typography>
        </Box>
        <Button variant="contained">
          Zaloguj się
        </Button>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemText primary="Email" secondary="—" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="Data dołączenia" secondary="—" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="Ukończone ścieżki" secondary="0" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="W trakcie nauki" secondary="0" />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Logowanie zostanie podpięte po skonfigurowaniu Keycloak w backendzie.
          Konto zarządzane jest przez system Keycloak (realm: pathly, client: web-app).
        </Typography>
      </Box>
    </>
  )
}
