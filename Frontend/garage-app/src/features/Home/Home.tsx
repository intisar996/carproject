import { useEffect } from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAppSelector, useAppDispatch } from "../../store/configureStore";
import { homePathForRole, paths } from "../../app/utils/paths";

import ChatAssistant from "../ChatAssistant/ChatAssistant";
import CustomerServices from "../Customer/CustomerServices";
import { fetchCustomerServicesAsync } from "../Customer/customerSlice";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { primaryButton } from "../../app/styles/mainButtonStyles";
import { TaskAltOutlined } from "@mui/icons-material";
import React from "react";

const colors = {
  blue: "var(--dark-oringe)",
  blueDark: "#174BC2",
  navy: "#1F1F1F",
  text: "var(--midnight--black)",
  muted: "#000000",
  background: "#F5F7FB",
  white: "#FFFFFF",
  border: "#E5EAF2",
  paleBlue: "#EAF1FF",
};

const secondaryButton = {
  minHeight: 48,
  px: 2.5,
  borderRadius: "10px",
  borderColor: "var(--midnight--black)",
  color: colors.text,
  fontWeight: 700,
  textTransform: "none",

  "&:hover": {
    borderColor: "var(--midnight--black)",
    bgcolor: "var(--light-oringe)",
  },
};

export default function Home() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.account.user);

  useEffect(() => {
    dispatch(fetchCustomerServicesAsync());
  }, [dispatch]);

  const goToServices = () => {
    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const steps = [
    {
      icon: "/images/inkbrush-tool-list.svg",
      number: "01",
      title: t("home.step1Title", "Choose a service"),
      description: t(
        "home.step1Description",
        "Select the service your car needs.",
      ),
    },
    {
      icon: "/images/inkbrush-booking-calendar.svg",
      number: "02",
      title: t("home.step2Title", "Book a garage"),
      description: t(
        "home.step2Description",
        "Choose a suitable garage and arrange your service.",
      ),
    },
    {
      icon: "/images/inkbrush-track-curve.svg",
      number: "03",
      title: t("home.step3Title", "Track your service"),
      description: t(
        "home.step3Description",
        "Follow updates until the work is completed.",
      ),
    },
  ];

  const benefits = [
    {
      icon: <VerifiedUserRoundedIcon />,
      title: t("home.trustedTitle", "Trusted garages"),
      description: t(
        "home.trustedDescription",
        "Find garages you can rely on.",
      ),
    },
    {
      icon: <LocationOnRoundedIcon />,
      title: t("home.trackingTitle", "Live tracking"),
      description: t(
        "home.trackingDescription",
        "Stay informed about your technician and service.",
      ),
    },
    {
      icon: <AccessTimeRoundedIcon />,
      title: t("home.fastTitle", "Save your time"),
      description: t(
        "home.fastDescription",
        "Manage your car services in one place.",
      ),
    },
  ];

  return (
    <Box component='main'>
      <Box
        sx={{
          backgroundImage: "url('/images/garagi-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "100vh",
          color: colors.text,
          overflowX: "clip",
        }}
        component='section'>
        <Container maxWidth='lg'>
          <Grid
            container
            alignItems='center'
            spacing={{ xs: 3, md: 5 }}
            sx={{ py: { xs: 4, md: 6 } }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "7%",
                    left: "0",
                    width: "100%",
                    height: "7px",
                    backgroundColor: "var(--dark-oringe)",
                    transform: "skewX(-30deg) rotate(-2deg)",
                    borderRadius: "2px",
                    zIndex: 13,
                  },
                }}>
                <Typography
                  component='h5'
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.11,
                    letterSpacing: "-0.045em",
                    maxWidth: 530,
                    fontSize: { xs: "2rem", md: "2rem" },
                    mb: 2,
                    color: "var(--midnight--black)",
                  }}>
                  {t("home.uptitle", "Car care, made simple.")}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: { xs: 1, md: 1.5 },
                  isolation: "isolate",
                  py: 2,
                }}>
                <Box
                  component='img'
                  src='/images/brushtitle.png'
                  alt=''
                  sx={{
                    position: "absolute",
                    width: { xs: "115%", md: "125%" },
                    height: "166%",
                    left: "-29%",
                    top: "-8%",
                    objectFit: "fill",
                    zIndex: -1,
                    pointerEvents: "none",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem" },
                    color: "#17243A",
                    lineHeight: 1.1,
                    transform: "rotate(-2deg)",
                    transformOrigin: "left center",
                    whiteSpace: "nowrap",
                  }}>
                  RUN YOUR GARAGE,
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem" },
                    color: "var(--dark-oringe)",
                    lineHeight: 1.1,
                    transform: "rotate(1.5deg)",
                    transformOrigin: "left center",
                    whiteSpace: "nowrap",
                  }}>
                  ALL IN ONE PLACE
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: colors.muted,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.9,
                  maxWidth: 480,
                  mb: 3,
                }}>
                {t(
                  "home.subtitle",
                  "Book trusted garages, track your service, and keep moving with confidence.",
                )}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems='stretch'
                sx={{ maxWidth: 440 }}>
                <Button
                  variant='contained'
                  onClick={goToServices}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={primaryButton}>
                  {t("home.exploreServices", "Explore services")}
                </Button>

                {user ? (
                  <Button
                    component={Link}
                    to={homePathForRole(user.role)}
                    variant='outlined'
                    sx={secondaryButton}>
                    {t("nav.dashboard", "Dashboard")}
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to={paths.login}
                    variant='outlined'
                    sx={secondaryButton}>
                    {t("nav.login", "Sign in")}
                  </Button>
                )}
              </Stack>

              <Stack direction='row' flexWrap='wrap' gap={2} sx={{ mt: 3.5 }}>
                {[
                  t("home.trust1", "Trusted garages"),
                  t("home.trust2", "Service updates"),
                  t("home.trust3", "Easy booking"),
                ].map((item) => (
                  <Stack
                    key={item}
                    direction='row'
                    alignItems='center'
                    spacing={1}
                    sx={{ margin: "0px 1%" }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        bgcolor: "#17243A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                      <TaskAltOutlined
                        sx={{
                          color: "#F5C542",
                          fontSize: 16,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: "#17243A",
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        fontWeight: 500,
                      }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 230, sm: 300, md: 380 },
                  borderRadius: { xs: "18px", md: "24px" },
                  overflow: "hidden",
                }}>
                <Box
                  className='car-animation'
                  component='img'
                  src='../../../public/images/CAR.png'
                  alt='Modern car ready for servicing'
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container
        id='services'
        maxWidth='lg'
        component='section'
        sx={{
          py: { xs: 4, md: 6 },
          scrollMarginTop: "80px",
        }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          justifyContent='space-between'
          gap={1}
          sx={{ mb: 3 }}>
          <Box>
            <Typography
              component='h2'
              sx={{
                fontSize: { xs: "1.65rem", md: "2.1rem" },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                mb: 1,
                color: colors.navy,
              }}>
              {t("home.servicesTitle", "What does your car need?")}
            </Typography>

            <Typography sx={{ color: colors.muted, lineHeight: 1.8 }}>
              {t(
                "home.servicesDescription",
                "Explore our available services and find the right care for your car.",
              )}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            "& > *": { minWidth: 0 },
            "& img": {
              maxWidth: "100%",
              objectFit: "cover",
            },
            "& .MuiCard-root": {
              height: "100%",
              border: `1px solid ${colors.border}`,
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(19,35,63,0.035)",
              transition:
                "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: colors.blue,
                boxShadow: "0 12px 25px rgba(19,35,63,0.08)",
              },
            },
          }}>
          <CustomerServices />
        </Box>
      </Container>

      <Box
        component='section'
        sx={{
          bgcolor: "var(--navy-color)",
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          py: { xs: 4, md: 5 },
        }}>
        <Container maxWidth='lg'>
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "19%",
                left: "0",
                width: "100%",
                height: "7px",
                backgroundColor: "var(--dark-oringe)",
                transform: "skewX(-30deg) rotate(-2deg)",
                borderRadius: "2px",
                zIndex: 13,
              },
            }}>
            <Typography
              component='h2'
              sx={{
                fontSize: { xs: "1.65rem", md: "2rem" },
                fontWeight: 800,
                color: "var(--ice-white)",
                mb: 3.5,
              }}>
              {t("home.stepsTitle", "Three simple steps")}
            </Typography>
          </Box>
          <Grid
            container
            spacing={{ xs: 2, md: 1.5 }}
            alignItems='stretch'
            justifyContent='center'
            sx={{
              position: "relative",
              py: { xs: 2, md: 3 },
            }}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <Grid
                  size={{ xs: 12, md: 3.5 }}
                  data-aos='fade-up'
                  data-aos-delay={index * 150}>
                  <Box
                    className='animate__animated animate__fadeInUp'
                    style={{
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: "both",
                    }}
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: { xs: 2, md: 2.5 },
                      height: "100%",
                      minHeight: { xs: 125, md: 170 },
                      p: { xs: 2, md: 2.5 },
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, var(--navy-liner),var(--navy-liner-light))",
                      border: "1px solid rgba(255,204,51,0.45)",
                      borderRadius: "14px 8px 16px 7px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      "&:hover": {
                        transform: { xs: "none", md: "translateY(-5px)" },
                        borderColor: "var(--dark-oringe)",
                      },
                    }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: 46, md: 54 },
                        height: { xs: 46, md: 54 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        bgcolor: "rgba(255,204,51,0.12)",
                        border: "1px solid rgba(255,204,51,0.3)",
                        color: "var(--dark-oringe)",
                        "& svg": {
                          fontSize: { xs: 27, md: 31 },
                          color: "var(--dark-oringe)",
                        },
                        "& img": {
                          width: 30,
                          height: 30,
                          objectFit: "contain",
                        },
                      }}>
                      {typeof step.icon === "string" ? (
                        <Box
                          component='img'
                          src={step.icon}
                          alt=''
                          sx={{
                            filter:
                              "invert(80%) sepia(50%) saturate(1000%) hue-rotate(350deg) brightness(100%) contrast(105%)",
                          }}
                        />
                      ) : (
                        step.icon
                      )}
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        position: "relative",
                        zIndex: 1,
                      }}>
                      <Typography
                        sx={{
                          color: "var(--dark-oringe)",
                          fontWeight: 900,
                          fontSize: "0.75rem",
                          letterSpacing: "1.5px",
                          mb: 0.8,
                        }}>
                        STEP {String(index + 1).padStart(2, "0")}
                      </Typography>

                      <Typography
                        component='h3'
                        sx={{
                          color: "var(--ice-white)",
                          fontWeight: 800,
                          fontSize: { xs: "1rem", md: "1.05rem" },
                          lineHeight: 1.5,
                          mb: 0.75,
                        }}>
                        {step.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: "var(--ice-white)",
                          fontSize: { xs: "0.82rem", md: "0.875rem" },
                          lineHeight: 1.8,
                          overflowWrap: "anywhere",
                        }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {index < steps.length - 1 && (
                  <Grid
                    size={{ xs: 12, md: 0.6 }}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      my: { xs: -0.5, md: 0 },
                    }}>
                    <Box
                      component='img'
                      src='/images/canvas.png'
                      alt=''
                      sx={{
                        width: { xs: "40%", md: "100%" },
                        height: { xs: 26, md: 26 },
                        objectFit: "contain",
                        filter:
                          "invert(80%) sepia(50%) saturate(1000%) hue-rotate(350deg) brightness(100%) contrast(105%)",
                        transform: {
                          xs: "rotate(90deg)",
                          md: "rotate(0deg)",
                        },
                      }}
                    />
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container
        maxWidth='lg'
        component='section'
        sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "7%",
              left: "0",
              width: "100%",
              height: "7px",
              backgroundColor: "var(--dark-oringe)",
              transform: "skewX(-30deg) rotate(-2deg)",
              borderRadius: "2px",
              zIndex: 13,
            },
          }}>
          <Typography
            component='h2'
            sx={{
              fontSize: { xs: "1.65rem", md: "2rem" },
              fontWeight: 800,
              color: colors.navy,
              mb: 1,
            }}>
            {t("home.whyTitle", "Why choose Car Services?")}
          </Typography>
        </Box>
        <Typography sx={{ color: colors.muted, lineHeight: 1.8, mb: 3 }}>
          {t(
            "home.featuresDescription",
            "A simpler way to find garages and manage your car care.",
          )}
        </Typography>

        <Grid container spacing={2}>
          {benefits.map((benefit, index) => (
            <Grid
              key={benefit.title}
              size={{ xs: 12, sm: 4 }}
              data-aos='zoom-in'
              data-aos-delay={index * 150}
              data-aos-duration='700'>
              <Box
                className='animate__animated animate__zoomIn'
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationFillMode: "both",
                }}
                sx={{
                  p: 2.5,
                  height: "100%",
                  bgcolor: "var(--dark-oringe)",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "14px",
                  display: "flex",
                  gap: 1.75,
                  alignItems: "flex-start",
                  transition: "all 0.3s ease",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    borderColor: "var(--dark-oringe)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                  },
                }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: colors.paleBlue,
                    color: "var(--navy-color)",
                    borderRadius: "12px",
                  }}>
                  {benefit.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      mb: 0.75,
                      color: "var(--navy-color)",
                    }}>
                    {benefit.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: colors.muted,
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                    }}>
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {!user && (
        <Box
          component='section'
          sx={{
            bgcolor: "var(--navy-color)",
            color: "#FFFFFF",
            py: { xs: 4, md: 5 },
          }}>
          <Container maxWidth='lg'>
            <Grid container spacing={3} alignItems='center'>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  component='h2'
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2rem" },
                    fontWeight: 800,
                    mb: 1,
                  }}>
                  {t("home.ctaTitle", "Own a garage? Join us.")}
                </Typography>

                <Typography sx={{ color: "#C6D0E0", lineHeight: 1.8 }}>
                  {t(
                    "home.ctaDescription",
                    "Connect with customers and manage your services in one place.",
                  )}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  fullWidth
                  component={Link}
                  to={paths.registerOwner}
                  variant='contained'
                  sx={primaryButton}>
                  {t("nav.registerGarage", "Register your garage")}
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      <Box
        component='footer'
        sx={{
          bgcolor: "#FFFFFF",
          borderTop: `1px solid ${colors.border}`,
          py: 3,
        }}>
        <Container maxWidth='lg'>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems='center'
            justifyContent='space-between'
            gap={2}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <DirectionsCarRoundedIcon sx={{ color: colors.blue }} />
              <Typography sx={{ color: colors.navy, fontWeight: 800 }}>
                {t("home.brand", "Car Services")}
              </Typography>
            </Stack>

            <Stack direction='row' spacing={2.5}>
              {user ? (
                <Box
                  component={Link}
                  to={homePathForRole(user.role)}
                  sx={{
                    color: colors.muted,
                    textDecoration: "none",
                    "&:hover": { color: colors.blue },
                  }}>
                  {t("nav.dashboard", "Dashboard")}
                </Box>
              ) : (
                <>
                  <Box
                    component={Link}
                    to={paths.login}
                    sx={{
                      color: colors.muted,
                      textDecoration: "none",
                      "&:hover": { color: colors.blue },
                    }}>
                    {t("nav.login", "Sign in")}
                  </Box>

                  <Box
                    component={Link}
                    to={paths.registerOwner}
                    sx={{
                      color: colors.muted,
                      textDecoration: "none",
                      "&:hover": { color: colors.blue },
                    }}>
                    {t("nav.registerGarage", "Register garage")}
                  </Box>
                </>
              )}
            </Stack>

            <Typography
              variant='body2'
              sx={{ color: colors.muted, textAlign: "center" }}>
              {t(
                "home.copyright",
                `© ${new Date().getFullYear()} Car Services. All rights reserved.`,
              )}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <ChatAssistant />
    </Box>
  );
}
