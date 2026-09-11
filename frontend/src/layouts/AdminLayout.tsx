import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import './AdminLayout.css'
import { useSignOut } from '@/features/auth/useSignOut'

const NAV = [
  { to: '/admin/visits', key: 'nav.visits' },
  { to: '/admin/on-site', key: 'nav.onSite' },
  { to: '/admin/locations', key: 'nav.locations' },
] as const

export function AdminLayout() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null)
  const signOut = useSignOut()

  const closeDrawer = useCallback(() => setOpen(false), [])
  const openDrawer = useCallback(() => setOpen(true), [])
  const openAccountMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAccountAnchor(event.currentTarget),
    [],
  )
  const closeAccountMenu = useCallback(() => setAccountAnchor(null), [])
  const signOutFromMenu = useCallback(() => {
    setAccountAnchor(null)
    signOut()
  }, [signOut])

  const nav = useMemo(
    () => (
      <List className="eos-admin__nav">
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            className="eos-admin__nav-item"
            onClick={closeDrawer}
          >
            <ListItemText primary={t(item.key)} />
          </ListItemButton>
        ))}
      </List>
    ),
    [closeDrawer, t],
  )

  return (
    <div className="eos-admin">
      <AppBar position="fixed" className="eos-admin__bar">
        <Toolbar className="eos-admin__toolbar">
          <IconButton
            edge="start"
            aria-label={t('nav.menu')}
            className="eos-admin__burger"
            onClick={openDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" component="h1" noWrap className="eos-admin__brand">
            {t('app.adminTitle')}
          </Typography>
          <LanguageSwitcher />
          <IconButton aria-label={t('admin.identity.account')} onClick={openAccountMenu}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={accountAnchor} open={accountAnchor !== null} onClose={closeAccountMenu}>
            <MenuItem onClick={signOutFromMenu}>{t('admin.identity.signOut')}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        className="eos-admin__drawer eos-admin__drawer--temporary"
      >
        <Toolbar />
        {nav}
      </Drawer>

      <Drawer variant="permanent" open className="eos-admin__drawer eos-admin__drawer--permanent">
        <Toolbar />
        {nav}
      </Drawer>

      <main className="eos-admin__main">
        <Toolbar />
        <Outlet />
      </main>
    </div>
  )
}
