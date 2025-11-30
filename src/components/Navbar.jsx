import React from "react";
import CardNav from "./CardNav";
import logo from "../assets/react.svg";

const Navbar = () => {
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company", href: "#" },
        { label: "Careers", ariaLabel: "About Careers", href: "#" },
      ],
    },
    {
      label: "Projects",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects", href: "#" },
        { label: "Case Studies", ariaLabel: "Project Case Studies", href: "#" },
      ],
    },
    {
      label: "Contact",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "mailto:info@example.com" },
        { label: "Twitter", ariaLabel: "Twitter", href: "https://twitter.com" },
        { label: "LinkedIn", ariaLabel: "LinkedIn", href: "https://linkedin.com" },
      ],
    },
  ];

  return (
<CardNav
  logo={logo}
  logoAlt="Company Logo"
  items={items}
  baseColor="#0B0B0F"         // darker base
  menuColor="#FFFFFF"         // white icons
  buttonBgColor="#c53ab5"     // dark button
  buttonTextColor="#FFFFFF"   // white text
  ease="power3.out"
  className="dark-nav"
/>

  );
};

export default Navbar;
