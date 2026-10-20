import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import {
  fetchCurrentUserAsync,
  signOut,
} from "../../features/Account/accountSlice";
import { setUnauthorizedHandler } from "../api/agent";
import { msUntilExpiry } from "../utils/jwt";
import { paths } from "../utils/paths";

const MAX_TIMEOUT = 2147483647;

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = useAppSelector((state) => state.account.user);
  const [loading, setLoading] = useState(!!user);

  const isRtl = i18n.language.startsWith("ar");

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    dispatch(fetchCurrentUserAsync()).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(signOut());
      toast.error(t("session.expired"));
      navigate(paths.login);
    });
  }, [dispatch, navigate, t]);

  useEffect(() => {
    if (!user?.token) return;

    const time = msUntilExpiry(user.token);

    if (time === null) return;

    const timer = setTimeout(() => {
      dispatch(signOut());
      toast.error(t("session.expired"));
      navigate(paths.login);
    }, Math.min(time, MAX_TIMEOUT));

    return () => clearTimeout(timer);
  }, [user?.token, dispatch, navigate, t]);

  const theme = useMemo(
    () =>
      createTheme({
        direction: isRtl ? "rtl" : "ltr",
        palette: {
          primary: { main: "#F5D34A" },
          secondary: { main: "#000000" },
          background: { default: "#F5F7FA" },
        },
        shape: {
          borderRadius: 8,
        },
 typography: {
  fontFamily: isRtl
    ? '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif'
    : '"Caveat Brush", "Segoe UI", Helvetica, Arial, sans-serif',

  h1: {
    fontFamily: isRtl
      ? '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif'
      : '"Caveat Brush", cursive',
    fontWeight: 400,
  },

  h2: {
    fontFamily: isRtl
      ? '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif'
      : '"Caveat Brush", cursive',
    fontWeight: 400,
  },

  h3: {
    fontFamily: isRtl
      ? '"Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif'
      : '"Caveat Brush", cursive',
    fontWeight: 400,
  },
},
      }),
    [isRtl]
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <ToastContainer
        position="bottom-right"
        hideProgressBar
        theme="colored"
        rtl={isRtl}
      />

      <Outlet />
    </ThemeProvider>
  );
}

export default App;