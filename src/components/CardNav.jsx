import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";

const CardNav = ({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#0D0D0D", // DARK THEME BASE
  menuColor = "#fff",
  buttonBgColor = "#1f1f1f",
  buttonTextColor = "#fff",
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");
      if (!contentEl) return 260;

      const prev = {
        visibility: contentEl.style.visibility,
        pointerEvents: contentEl.style.pointerEvents,
        position: contentEl.style.position,
        height: contentEl.style.height,
      };

      contentEl.style.visibility = "visible";
      contentEl.style.pointerEvents = "auto";
      contentEl.style.position = "static";
      contentEl.style.height = "auto";

      const topBar = 60;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;

      Object.assign(contentEl.style, prev);
      return topBar + contentHeight + padding;
    }
    return 260;
  };

  const createTimeline = () => {
    if (!navRef.current) return null;

    gsap.set(navRef.current, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navRef.current, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1"
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        newTl?.progress(1);
        tlRef.current = newTl;
      } else {
        tlRef.current.kill();
        tlRef.current = createTimeline();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i) => (el) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em]">
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""} block h-[60px] p-0 rounded-xl shadow-lg relative overflow-hidden`}
        style={{ backgroundColor: baseColor, color: "#fff" }}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          
          <div
            className={`hamburger-menu ${
              isHamburgerOpen ? "open" : ""
            } group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px]`}
            onClick={toggleMenu}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            style={{ color: menuColor }}
          >
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-all ${
                isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
              }`}
            />
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-all ${
                isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
              }`}
            />
          </div>

          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            <img src={logo} alt={logoAlt} className="logo h-[28px]" />
          </div>

          <button
            className="card-nav-cta-button hidden md:inline-flex rounded-lg px-4 items-center h-full border border-[#333]"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            Get Started
          </button>
        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col gap-2 ${
            isExpanded ? "visible" : "invisible"
          } md:flex-row md:items-end`}
        >
          {(items || []).map((item, idx) => (
            <div
              key={idx}
              ref={setCardRef(idx)}
              className="nav-card flex flex-col gap-2 p-4 rounded-xl"
              style={{
                backgroundColor: item.bgColor || "#1A1A1A",
                color: item.textColor || "#fff",
              }}
            >
              <div className="text-lg md:text-xl font-semibold">
                {item.label}
              </div>

              <div className="mt-auto flex flex-col gap-1">
                {item.links?.map((lnk, i) => (
                  <a
                    key={i}
                    href={lnk.href}
                    className="flex items-center gap-1 text-sm opacity-90 hover:opacity-100 transition"
                  >
                    <GoArrowUpRight />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
