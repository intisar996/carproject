import { Avatar, Container, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md";
}

export default function AuthCard({ title, icon, children, maxWidth = "xs" }: Props) {
  return (
    <Container
      component={Paper}
      maxWidth={maxWidth}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4, mt: "4%" }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{icon}</Avatar>
      <Typography component="h1" variant="h5" sx={{ mb: 1, textAlign: "center" }}>
        {title}
      </Typography>
      {children}
    </Container>
  );
}
