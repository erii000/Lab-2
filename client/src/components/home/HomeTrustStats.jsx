import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { Box, Grid, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "../../hooks/useCountUp.js";
import { designTokens } from "../../theme/theme.js";
import { trustStats } from "./homeData.js";

const iconMap = {
  trips: FlightTakeoffRoundedIcon,
  destinations: PublicRoundedIcon,
  ai: AutoAwesomeRoundedIcon,
  support: AccessTimeRoundedIcon,
};

function AnimatedStatValue({ stat, active }) {
  const animated = useCountUp(stat.animate?.end ?? 0, {
    duration: 1800,
    active: active && Boolean(stat.animate),
  });

  if (stat.staticValue) {
    return (
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          color: "common.white",
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stat.staticValue}
      </Typography>
    );
  }

  const display = `${Math.round(animated)}${stat.animate.suffix}`;

  return (
    <Typography
      variant="h5"
      fontWeight={800}
      sx={{
        color: "common.white",
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
        minWidth: "3.5ch",
      }}
    >
      {display}
    </Typography>
  );
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

function TrustStatCard({ stat, active, delay = 0 }) {
  const Icon = iconMap[stat.icon];

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 2.25,
        px: 1.5,
        borderRadius: 2.5,
          border: `1px solid ${alpha(designTokens.brand.gold, 0.22)}`,
        bgcolor: alpha("#0b0d12", 0.55),
        backdropFilter: "blur(12px)",
        opacity: active ? 1 : 0.4,
        animation: active ? `${fadeUp} 0.55s ease-out ${delay}ms both` : "none",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          mx: "auto",
          mb: 1.25,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(designTokens.brand.navy, 0.22),
          color: designTokens.brand.champagne,
          border: `1px solid ${alpha(designTokens.brand.gold, 0.25)}`,
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <AnimatedStatValue stat={stat} active={active} />
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.5,
          color: alpha("#fff", 0.78),
          fontWeight: 600,
          letterSpacing: "0.04em",
          lineHeight: 1.35,
        }}
      >
        {stat.label}
      </Typography>
    </Box>
  );
}

export default function HomeTrustStats() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Grid container spacing={2} ref={ref} sx={{ mt: 3 }}>
      {trustStats.map((stat, index) => (
        <Grid key={stat.id} size={{ xs: 6, md: 3 }}>
          <TrustStatCard stat={stat} active={inView} delay={index * 90} />
        </Grid>
      ))}
    </Grid>
  );
}
