/**
 * Inline SVG icons (no @mui/icons-material) — avoids peer/version conflicts on install.
 * Paths follow Material Design icon shapes where applicable.
 */
import { useId } from "react";
import SvgIcon from "@mui/material/SvgIcon";

function mk(path, viewBox = "0 0 24 24") {
  function Icon(props) {
    return (
      <SvgIcon {...props} viewBox={viewBox}>
        <path d={path} fill="currentColor" />
      </SvgIcon>
    );
  }
  return Icon;
}

/** @type {typeof SvgIcon} */
export const MenuIcon = mk(
  "M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z",
);

/** Map pin — travel / destination brand mark */
export const TravelExploreRounded = mk(
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
);

export const GitHubIcon = mk(
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
);

export const EmailOutlined = mk(
  "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0L12 11 4 6zm0 12H4V8l8 5 8-5z",
);

export const FilterListRounded = mk(
  "M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z",
);

export const SearchRounded = mk(
  "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
);

export const CloseRounded = mk(
  "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
);

export const ExploreRounded = mk(
  "M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1 1.1-.49 1.1-1.1-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.19 12.19L13 13.81V18h-2v-4.19l-3.19 3.19-1.41-1.41L12 11.62l3.59 3.59z",
);

export const SavingsRounded = mk(
  "M15 10c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zm-6 0c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zm9-6H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H6V8h12z",
);

export const TimelineRounded = mk(
  "M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07L9.91 14.07c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.57-4.56C14.02 8.35 14 8.18 14 8c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.56-3.55C23.02 7.65 23 7.82 23 8z",
);

export const TrendingUpRounded = mk(
  "m16 6-2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
);

export const AutoAwesomeRounded = mk(
  "m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7 4L9 21l1.63-7L3 10h7L11 3l1 7 7 1z",
);

export const MapRounded = mk(
  "M20.5 3-.16.09L15 5.1 9 3 .5 6.49v14.94l6.04 2.52 6-2.42 6.04 2.52 5.96-3.02V5.51zM15 19.09l-6-2.42V5.91l6 2.42z",
);

export const ViewListRounded = mk(
  "M3 14h4v-4H3zm0 5h4v-4H3zM3 9h4V5H3zm5 15h14v-4H8zm0-5h14v-4H8zm0-10v4h14V5z",
);

/** Dashboard grid — admin / overview */
export const DashboardRounded = mk(
  "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
);

export const StarRounded = mk(
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
);

export const AcUnitRounded = mk(
  "M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 3.93 6.34 5.34 11 10v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.41 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.41L17.83 13H22z",
);

export const WbSunnyRounded = mk(
  "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zm9-9.95h2v3.01h-2zm7.51-3.67-1.41 1.41 1.79 1.8 1.41-1.41zM17.24 18.16l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6m0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 13.95h2v-3.02h-2zm-7.45-4.67-1.41 1.41 1.8 1.79 1.41-1.41z",
);

export const ExpandMoreRounded = mk(
  "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z",
);

export const NotificationsOutlined = mk(
  "M12 22a2 2 0 0 0 1.99-1.8L14 20h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 1 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",
);

export const SendRounded = mk(
  "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
);

export const Google = mk(
  "M21.35 11.1H12v2.89h5.35c-.24 1.42-1.71 4.17-5.35 4.17-3.22 0-5.84-2.66-5.84-5.93S8.78 6.3 12 6.3c1.83 0 3.06.78 3.76 1.44l2.57-2.49C16.61 3.99 14.52 3 12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c5.82 0 9.67-4.09 9.67-9.82 0-.66-.06-1.14-.14-1.62z",
);

export const FlightRounded = mk(
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z",
);

export const HotelRounded = mk(
  "M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3m12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4",
);

export const LocalActivityRounded = mk(
  "M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2m-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.35-2.73 4.26-.37L12 6.1l1.59 4.18 4.26.37-3.35 2.73z",
);

export const AddRounded = mk(
  "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",
);

export const DragIndicatorRounded = mk(
  "M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2",
);

export const EditRounded = mk(
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
);

export const RefreshRounded = mk(
  "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z",
);

export const ShareRounded = mk(
  "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92",
);

export const DeleteOutlineRounded = mk(
  "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z",
);

export const CameraAltRounded = mk(
  "M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3",
);

export const RestaurantRounded = mk(
  "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2zm5-3v8h2.5V22H21V2c-2.76 0-5 2.24-5 4",
);

export const SpaRounded = mk(
  "M12 2c-2.21 0-4 1.79-4 4 0 1.5.82 2.8 2.03 3.49C8.8 10.24 8 11.53 8 13c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.47-.8-2.76-2.03-3.51A3.996 3.996 0 0 0 16 6c0-2.21-1.79-4-4-4m0 18c-3.31 0-6-2.69-6-6h12c0 3.31-2.69 6-6 6",
);

export const VerifiedRounded = mk(
  "M23 12 20.56 9.22 20.9 5.54 17.29 4.72 15.4 1.54 12 3 8.6 1.54 6.71 4.72 3.1 5.53 3.44 9.21 1 12l2.44 2.78-.34 3.69 3.61.81L8.6 22.46 12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68zm-12.09 4.72L7.29 13.1l1.41-1.41 2.21 2.21 4.88-4.88 1.41 1.41z",
);

/** New brand mark: compass + paper plane */
export const BrandCompassLogo = mk(
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.95 6.05-2.2 6.25-6.25 2.2 2.2-6.25 6.25-2.2zM12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1 1.1-.49 1.1-1.1-.49-1.1-1.1-1.1z",
);

/** Premium logo with layered mark for stronger visual identity */
export function BrandAuroraLogo(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="brandAuroraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8d58a" />
          <stop offset="55%" stopColor="#d4af6a" />
          <stop offset="100%" stopColor="#9b7a3e" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2 3.3 6.1v5.8c0 5.1 3.6 9.9 8.7 10.9 5.1-1 8.7-5.8 8.7-10.9V6.1z"
        fill="url(#brandAuroraGrad)"
      />
      <path
        d="m12 5.8 4.4 1.9v4.1c0 3.3-2.2 6.4-4.4 7.2-2.2-.8-4.4-3.9-4.4-7.2V7.7z"
        fill="#111318"
        opacity="0.9"
      />
      <path
        d="m8.5 12 2.1 1.9 4.9-4.9 1 1-5.9 5.9-3.1-2.9z"
        fill="#f4e7c8"
      />
      <circle cx="12" cy="7.6" r="1.05" fill="#f8d58a" />
    </SvgIcon>
  );
}

/**
 * Smart Travel brand mark — obsidian tile, gold journey arc, destination pin, AI node.
 * Readable from 20px (navbar) to 32px+ (footer).
 */
export function SmartTravelLogo(props) {
  const uid = useId().replace(/:/g, "");
  const gold = `stGold-${uid}`;
  const glow = `stGlow-${uid}`;

  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <defs>
        <linearGradient id={gold} x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7E8C3" />
          <stop offset="45%" stopColor="#D4AF6A" />
          <stop offset="100%" stopColor="#9A7B42" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#D4AF6A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#D4AF6A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0B0D12" />
      <rect
        x="1.75"
        y="1.75"
        width="28.5"
        height="28.5"
        rx="8.25"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="0.9"
        opacity="0.5"
      />
      <circle cx="16" cy="17" r="10" fill={`url(#${glow})`} />
      <path
        d="M7 22.25c2.8-7.5 7.2-11.25 16-9.5"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="22.25" r="1.35" fill={`url(#${gold})`} />
      <path
        d="M16 10.5c-2.05 0-3.75 1.55-3.75 3.45 0 2.6 3.75 6.1 3.75 6.1s3.75-3.5 3.75-6.1c0-1.9-1.7-3.45-3.75-3.45z"
        fill={`url(#${gold})`}
      />
      <circle cx="16" cy="14" r="1.1" fill="#0B0D12" />
      <circle cx="23.25" cy="10.75" r="1.7" fill="#F4E7C8" />
      <path
        d="M23.25 9.1l.35 1.15 1.15.35-1.15.35-.35 1.15-.35-1.15-1.15-.35 1.15-.35z"
        fill="#0B0D12"
        opacity="0.85"
      />
    </SvgIcon>
  );
}

/** @deprecated Alias — use SmartTravelLogo */
export function BrandMonogramLogo(props) {
  return <SmartTravelLogo {...props} />;
}

export const ChevronLeftRounded = mk(
  "M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z",
);

export const ChevronRightRounded = mk(
  "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z",
);

export const MicRounded = mk(
  "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z",
);

export const BookmarkRounded = mk(
  "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2",
);

export const CompareRounded = mk(
  "M9.01 14H2v2h7.01v3L13 15l-3.99-4v3m5.98-1v-3H22v-2h-7.01V5L11 9z",
);

export const WarningAmberRounded = mk(
  "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z",
);

export const MoreVertRounded = mk(
  "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
);
