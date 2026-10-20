import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link, Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../app/components/LanguageSwitcher";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { signOut } from "../Account/accountSlice";
import { paths } from "../../app/utils/paths";
import { menuForRole } from "./menu";

const drawerWidth = 250;

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.account.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!user) return null;

  const menuItems = menuForRole(user.role);
  const isSelected = (path: string, matchPrefix?: boolean) =>
    Boolean(matchPath({ path, end: !matchPrefix }, location.pathname));
  const current = menuItems.find((item) => isSelected(item.path, item.matchPrefix));

  const handleLogout = () => {
    dispatch(signOut());
    navigate(paths.login, { replace: true });
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ height: 70, display: "flex", alignItems: "center", px: 3, bgcolor: "var(--navy-color)" }}>
        <Typography variant="h6" sx={{ color: "var(--ice-white)", fontWeight: "bold" }}>
          {t("app.name")}
        </Typography>
      </Box>
      <Divider />

      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: "bold" }} noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t(`role.${user.role}`)}
          </Typography>
        </Box>
      </Box>
      <Divider />

      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={isSelected(item.path, item.matchPrefix)}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary={t("nav.logout")} />
        </ListItemButton>
      </Box>
    </Box>
  );

  const anchor = theme.direction === "rtl" ? "right" : "left";
  const paperSx = { "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            anchor={anchor}
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={paperSx}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer anchor={anchor} variant="permanent" open sx={paperSx}>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid #e5e7eb" }}
        >
          <Toolbar sx={{ minHeight: 70, gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="menu">
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold",color:"black" }} noWrap>
                {current ? t(current.labelKey) : t("menu.dashboard")}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {t("app.tagline")}
              </Typography>
            </Box>
            <LanguageSwitcher />
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="account">
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                {user.fullName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled sx={{ opacity: "1 !important" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {user.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem
                component={Link}
                to={paths.changePassword}
                onClick={() => setAnchorEl(null)}
              >
                <ListItemIcon>
                  <LockResetIcon fontSize="small" />
                </ListItemIcon>
                {t("menu.changePassword")}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                {t("nav.logout")}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
