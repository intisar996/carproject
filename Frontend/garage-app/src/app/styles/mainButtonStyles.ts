





export const primaryButton = {
  position: "relative",
  minHeight: 48,
  px: 2.5,
  border: "2px solid var(--midnight--black)",
  borderRadius: "2px 5px 3px 1px",
  color: "#000000",
  fontWeight: 700,
  textTransform: "none",
  overflow: "visible",
  bgcolor: "var(--light-oringe)",
  "&::before": {
    content: '""',
    position: "absolute",
    inset:"-3px -2px -4px -1px",
    border: "1px solid var(--midnight--black)",
    borderRadius: "5px 1px 6px 2px",
    transform: "rotate(-1deg)",
    pointerEvents: "none",
  },

  "&:hover": {
    bgcolor: "var(--light-havor)",
  },
};


export const thirdButton = {
  position: "relative",
  minHeight: 48,
  px: 2.5,
  border: "2px solid var(--midnight--black)",
  borderRadius: "2px 5px 3px 1px",
  color: "var(--ice-white)",
  fontWeight: 700,
  textTransform: "none",
  overflow: "visible",
  bgcolor: "var(--midnight--black)",
  "&::before": {
    content: '""',
    position: "absolute",
    inset:"-3px -2px -4px -1px",
    border: "1px solid var(--midnight--black)",
    borderRadius: "5px 1px 6px 2px",
    transform: "rotate(-1deg)",
    pointerEvents: "none",
  },

  "&:hover": {
    bgcolor: "var(--light-havor)",
    color: "var(--midnight--black)",
  },
};




export const brushButtonStyle = {
  position: "relative" as const,
  isolation: "isolate" as const,
  overflow: "visible",
  px: 2.5,
  py: 1.2,
  minHeight: 44,
  color: "#101820",
  backgroundColor: "transparent",
  borderRadius: 0,
  fontWeight: 800,
  fontSize: "0.85rem",
  textTransform: "none" as const,
  textDecoration: "none",
  zIndex: 0,
  transition: "color 0.2s ease, transform 0.2s ease",

  "&::before": {
    content: '""',
    position: "absolute",
    inset: "3px 0",
    backgroundColor: "#FFD43B",
    clipPath:
      "polygon(2% 7%, 96% 0, 100% 15%, 98% 82%, 94% 100%, 4% 94%, 0 80%, 1% 20%)",
    zIndex: -1,
    transition: "transform 0.2s ease",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    inset: "0 -3px -3px 3px",
    border: "3px solid #FFD43B",
    clipPath:
      "polygon(3% 8%, 97% 2%, 100% 90%, 5% 100%, 0 82%)",
    zIndex: -2,
    pointerEvents: "none",
  },

  "&:hover": {
    backgroundColor: "transparent",
    color: "#101820",
    transform: "translate(-1px, -2px)",
  },

  "&:hover::before": {
    transform: "rotate(-0.5deg) scale(1.02)",
  },
};
