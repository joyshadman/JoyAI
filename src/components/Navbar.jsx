import React from "react";
import CardNav from "./CardNav";
import logo from "../assets/JoyAI.png";

const Navbar = () => {
  const items = [
    {
      label: "Chat to JoyAI",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Go now", ariaLabel: "Chat to JoyAI", to: "/prompt" }, 
      ],
    },
    {
      label: "Image Generation",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Go Now", ariaLabel: "Image Generation", to: "/promptpage" },
      ],
    },
  ];

  return (
    <CardNav
      logo={logo}
      logoAlt="Company Logo"
      items={items}               // pass items as-is
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
