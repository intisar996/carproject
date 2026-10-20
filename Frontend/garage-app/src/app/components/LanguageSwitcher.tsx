import { Language } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={t("common.language")}
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
      >
        <Language />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {LANGUAGES.map(({ code, label }) => (
          <MenuItem
            key={code}
            selected={i18n.language === code}
            onClick={() => changeLanguage(code)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
