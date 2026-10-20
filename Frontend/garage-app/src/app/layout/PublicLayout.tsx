import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAppSelector } from "../../store/configureStore";
import { homePathForRole, paths } from "../utils/paths";
import { thirdButton } from "../../app/styles/mainButtonStyles";
import { brushButtonStyle } from "../../app/styles/mainButtonStyles";

export default function PublicLayout() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.account.user);

  const navLinkStyle = {
    color: "#F7F5EF",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
    textTransform: "none" as const,
    minWidth: "auto",
    px: 1.5,
    position: "relative" as const,
    "&:hover": {
      color: "#FFD43B",
      backgroundColor: "transparent",
    },
    "&::after": {
      content: '""',
      position: "absolute" as const,
      bottom: 3,
      left: "20%",
      width: "60%",
      height: "2px",
      backgroundColor: "#FFD43B",
      transform: "scaleX(0)",
      transition: "transform 0.2s ease",
    },
    "&:hover::after": {
      transform: "scaleX(1)",
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position='sticky'
        elevation={0}
        sx={{
          bgcolor: "#101820",
          color: "#F7F5EF",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
        <Container maxWidth='xl'>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 68, md: 76 },
              gap: { xs: 1, md: 2 },
            }}>
            <Box
              component={Link}
              to={paths.home}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
                flexShrink: 0,
                textDecoration: "none",
                color: "#FFD43B",
                width: "fit-content",
              }}>
              <Box
                component='img'
                src='/images/inkbrush-car-motion.svg'
                alt='GARAGI'
                sx={{
                  height: { xs: 38, md: 46 },
                  width: { xs: 60, md: 76 },
                  objectFit: "contain",
                  filter:
                    "brightness(0) saturate(100%) invert(83%) sepia(91%) saturate(1000%) hue-rotate(335deg)",
                }}
              />

              <Typography
                component='span'
                sx={{
                  fontFamily: '"Permanent Marker", cursive',
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                  color: "#FFD43B",
                }}>
                GARAGI
              </Typography>
            </Box>

            <Box
              component='nav'
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                gap: { md: 1, lg: 2 },
                flexGrow: 1,
              }}>
              <Button component={Link} to={paths.home} sx={navLinkStyle}>
                Home
              </Button>

              <Button
                component='a'
                href={`${paths.home}#services`}
                sx={navLinkStyle}>
                Services
              </Button>

              <Button
                component='a'
                href={`${paths.home}#about`}
                sx={navLinkStyle}>
                About
              </Button>

              <Button
                component='a'
                href={`${paths.home}#contact`}
                sx={navLinkStyle}>
                Contact
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: { xs: 0.5, sm: 1.5 },
                flexShrink: 0,
              }}>
              <Box
                sx={{
                  "& button, & .MuiIconButton-root": {
                    color: "#F7F5EF",
                  },
                }}>
                <LanguageSwitcher />
              </Box>

              {user ? (
                <Button
                  component={Link}
                  to={homePathForRole(user.role)}
                  sx={{
                    ...navLinkStyle,
                    whiteSpace: "nowrap",
                  }}>
                  {t("nav.dashboard")}
                </Button>
              ) : (
                <>
                  <Button
                    component={Link}
                    to={paths.login}
                    sx={{
                      ...navLinkStyle,
                      whiteSpace: "nowrap",
                      display: { xs: "none", sm: "inline-flex" },
                    }}>
                    {t("nav.login")}
                  </Button>

                  <Button
                    component={Link}
                    to={paths.registerOwner}
                    variant='contained'
                    sx={brushButtonStyle}>
                    {t("nav.registerGarage")}
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        disableGutters
        maxWidth={false}
        sx={{ width: "100%", maxWidth: "none", margin: 0, padding: 0, mt: 0 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
