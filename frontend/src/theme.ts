import { createTheme } from '@mui/material/styles'

export const brand = {
  accent: '#FF8200',
  palette: {
    primary: { main: '#FF8200', light: '#FF9E38', dark: '#C66200', contrastText: '#000000' },
    secondary: { main: '#FFFFFF', light: '#FFFFFF', dark: '#C9C9C9', contrastText: '#000000' },
    success: { main: '#3FBF6B', light: '#6FD191', dark: '#2A8C4C', contrastText: '#000000' },
    info: { main: '#8AB4F8', light: '#AFCCFA', dark: '#5B85C8', contrastText: '#000000' },
    warning: { main: '#FFB020', light: '#FFC552', dark: '#C68300', contrastText: '#000000' },
    error: { main: '#FF5A4E', light: '#FF8579', dark: '#C63A31', contrastText: '#000000' },
    background: { default: '#000000', paper: '#0D0D0D' },
    text: { primary: '#FFFFFF', secondary: '#A8A8A8', disabled: '#6B6B6B' },
    divider: '#262626',
    action: {
      hover: 'rgba(255, 130, 0, 0.08)',
      selected: 'rgba(255, 130, 0, 0.14)',
      disabled: '#4D4D4D',
      disabledBackground: '#1A1A1A',
    },
  },
}

export const theme = createTheme({
  cssVariables: { cssVarPrefix: 'eos', colorSchemeSelector: 'class' },
  colorSchemes: {
    light: { palette: brand.palette },
    dark: { palette: brand.palette },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      'Segoe UI',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 650, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    overline: { letterSpacing: '0.14em', fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiChip: { defaultProps: { variant: 'filled' } },
    MuiDialog: { defaultProps: { scroll: 'paper' } },
  },
})
