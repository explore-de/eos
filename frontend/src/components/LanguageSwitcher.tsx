import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { supportedLngs } from '../i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = useMemo(
    () =>
      supportedLngs.includes(i18n.resolvedLanguage as never)
        ? (i18n.resolvedLanguage as string)
        : supportedLngs[0],
    [i18n.resolvedLanguage],
  )

  const changeLanguage = useCallback(
    (event: { target: { value: string } }) => void i18n.changeLanguage(event.target.value),
    [i18n],
  )

  return (
    <TextField
      select
      size="small"
      label={t('language.label')}
      value={current}
      onChange={changeLanguage}
      slotProps={{ htmlInput: { 'aria-label': t('language.label') } }}
    >
      {supportedLngs.map((lng) => (
        <MenuItem key={lng} value={lng}>
          {t(`language.${lng}`)}
        </MenuItem>
      ))}
    </TextField>
  )
}
