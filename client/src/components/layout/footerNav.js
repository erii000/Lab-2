import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import XIcon from "@mui/icons-material/X";

export const footerQuickLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "AI Assistant", to: "/assistant" },
  { label: "Bookings", to: "/bookings" },
  { label: "Contact", to: "/contact" },
];

export const footerAccountLinks = [
  { label: "Log in", to: "/login", Icon: LoginRoundedIcon, variant: "outlined" },
  { label: "Sign up", to: "/register", Icon: PersonAddAltRoundedIcon, variant: "contained" },
];

export const footerSocialLinks = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookRoundedIcon },
  { label: "X", href: "https://x.com", Icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
];

export const footerContact = {
  email: "support@smarttravel.app",
  phone: "+355 69 000 0000",
  address: "Tirana, Albania",
};
