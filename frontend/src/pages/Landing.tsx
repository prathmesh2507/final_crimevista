import React, { useState } from "react";
import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  BarChart3Icon,
  FileTextIcon,
  MapIcon,
  MapPinnedIcon,
  MenuIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/layout/BrandMark";

const features = [
  {
    icon: MapIcon,
    title: "Crime mapping",
    description:
      "Explore incident locations and patterns across Nagpur on an interactive map.",
    to: "/map",
    color: "text-sky-300",
    tone: "bg-sky-400/10",
  },
  {
    icon: BarChart3Icon,
    title: "Clear analytics",
    description:
      "Turn recorded incidents into useful summaries, comparisons, and trends.",
    to: "/dashboard",
    color: "text-violet-300",
    tone: "bg-violet-400/10",
  },
  {
    icon: TrendingUpIcon,
    title: "Trend exploration",
    description:
      "See how incident patterns change over time and across crime types.",
    to: "/trends",
    color: "text-emerald-300",
    tone: "bg-emerald-400/10",
  },
  {
    icon: FileTextIcon,
    title: "Insightful reports",
    description:
      "Create focused reports to support review, planning, and discussion.",
    to: "/reports",
    color: "text-amber-300",
    tone: "bg-amber-400/10",
  },
];

function NagpurMapPreview() {
  const roads = [
    "M12 116 C108 94 137 147 232 122 S365 76 488 105",
    "M31 205 C116 188 169 213 258 185 S391 166 482 190",
    "M48 40 C106 94 151 113 188 154 S262 225 292 274",
    "M168 14 C154 84 199 113 237 148 S329 197 359 265",
    "M354 12 C320 73 344 114 380 146 S431 210 418 270",
    "M18 266 C92 240 142 247 200 213 S316 110 470 52",
  ];
  const points = [
    [91, 104],
    [124, 119],
    [150, 87],
    [176, 149],
    [203, 122],
    [224, 177],
    [248, 144],
    [270, 201],
    [292, 164],
    [313, 116],
    [334, 183],
    [355, 151],
    [381, 201],
    [403, 126],
    [426, 163],
    [191, 205],
    [142, 178],
    [302, 226],
    [363, 96],
    [239, 89],
  ];

  return (
    <svg
      viewBox="0 0 500 300"
      className="h-full w-full"
      role="img"
      aria-label="Illustrative city map preview with incident markers"
    >
      <defs>
        <pattern id="landing-map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#163458" strokeWidth="0.7" />
        </pattern>
        <radialGradient id="landing-map-glow">
          <stop offset="0" stopColor="#0ea5e9" stopOpacity=".2" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <filter id="landing-point-glow" x="-200%" y="-200%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="500" height="300" fill="#06172b" />
      <rect width="500" height="300" fill="url(#landing-map-grid)" />
      <ellipse cx="263" cy="151" rx="205" ry="150" fill="url(#landing-map-glow)" />
      <path
        d="M20 48 82 29l51 10 35-20 63 13 47-17 62 23 54-8 74 33-14 43 25 38-26 54 7 47-56 21-55-14-54 18-58-15-52 20-68-24-60 4-41-37 11-49-21-38 19-43Z"
        fill="#0c2440"
        stroke="#15548a"
        strokeWidth="1.5"
      />
      {roads.map((road, index) => (
        <path
          key={road}
          d={road}
          fill="none"
          stroke={index % 2 ? "#1d466b" : "#2876a9"}
          strokeWidth={index % 2 ? "2" : "1.2"}
          strokeDasharray={index % 2 ? undefined : "4 5"}
        />
      ))}
      <path
        d="M30 143 C115 119 172 165 237 151 S368 102 474 137"
        fill="none"
        stroke="#35bdf5"
        strokeOpacity=".62"
        strokeWidth="2"
      />
      {points.map(([cx, cy], index) => (
        <g key={`${cx}-${cy}`} filter={index % 4 === 0 ? "url(#landing-point-glow)" : undefined}>
          <circle
            cx={cx}
            cy={cy}
            r={index % 5 === 0 ? 5 : 3.5}
            fill={index % 4 === 0 ? "#fb7185" : index % 3 === 0 ? "#fbbf24" : "#38bdf8"}
            fillOpacity=".95"
          />
          <circle
            cx={cx}
            cy={cy}
            r={index % 5 === 0 ? 9 : 7}
            fill="none"
            stroke={index % 4 === 0 ? "#fb7185" : "#38bdf8"}
            strokeOpacity=".36"
          />
        </g>
      ))}
      <g transform="translate(222 135)">
        <circle r="28" fill="#38bdf8" fillOpacity=".09" />
        <circle r="17" fill="#38bdf8" fillOpacity=".15" />
        <circle r="7" fill="#7dd3fc" stroke="#e0f2fe" strokeWidth="2" />
        <text
          x="12"
          y="34"
          fill="#d9f3ff"
          fontSize="12"
          fontFamily="sans-serif"
          fontWeight="600"
        >
          NAGPUR
        </text>
      </g>
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div className="landing-dashboard relative overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/95 shadow-[0_30px_100px_rgba(0,0,0,.55)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-400/15 text-sky-300">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-wide text-white">CrimeVista</p>
            <p className="text-[9px] text-slate-400">Nagpur urban safety</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          PLATFORM PREVIEW
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_126px] gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_158px] sm:gap-4 sm:p-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-white sm:text-sm">Incident map</p>
              <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
                Explore recorded incidents across Nagpur
              </p>
            </div>
            <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[9px] text-slate-300 sm:block">
              Interactive view
            </span>
          </div>
          <div className="h-[190px] overflow-hidden rounded-xl border border-sky-300/15 sm:h-[260px]">
            <NagpurMapPreview />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Trends", icon: TrendingUpIcon, color: "text-sky-300" },
              { label: "Hotspots", icon: MapPinnedIcon, color: "text-orange-300" },
              { label: "Reports", icon: FileTextIcon, color: "text-violet-300" },
            ].map(({ label, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-white/[.07] bg-white/[.03] px-2.5 py-2"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} aria-hidden />
                <span className="text-[9px] text-slate-300 sm:text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-2.5 pt-8">
          <p className="mb-1 text-[10px] font-medium text-slate-400">Explore the platform</p>
          {[
            { name: "Overview", detail: "City-wide summary", icon: BarChart3Icon, color: "text-sky-300" },
            { name: "Crime map", detail: "Location patterns", icon: MapIcon, color: "text-rose-300" },
            { name: "Area explorer", detail: "Compare local areas", icon: MapPinnedIcon, color: "text-amber-300" },
          ].map(({ name, detail, icon: Icon, color }) => (
            <div
              key={name}
              className="rounded-lg border border-white/[.07] bg-white/[.035] p-2.5 sm:p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${color}`} aria-hidden />
                <p className="text-[10px] font-medium text-slate-200 sm:text-[11px]">{name}</p>
              </div>
              <p className="mt-1 pl-[22px] text-[8px] text-slate-500 sm:text-[9px]">{detail}</p>
            </div>
          ))}
          <div className="rounded-lg border border-sky-300/10 bg-sky-300/[.05] p-2.5 sm:p-3">
            <p className="text-[9px] font-medium text-sky-200">Built for exploration</p>
            <p className="mt-1 text-[8px] leading-relaxed text-slate-400 sm:text-[9px]">
              Use filters and focused views to explore the available data.
            </p>
          </div>
        </aside>
      </div>
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
    </div>
  );
}

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#050e1d] text-white">
      <div className="landing-ambient pointer-events-none absolute inset-x-0 top-0 h-[760px]" />
      <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="CrimeVista home"
          onClick={closeMenu}
        >
          <span className="landing-brand-mark grid h-11 w-11 place-items-center rounded-xl">
            <BrandMark />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight tracking-tight sm:text-xl">
              Crime<span className="text-sky-400">Vista</span>
            </span>
            <span className="block text-[10px] leading-tight tracking-wide text-slate-400 sm:text-xs">
              NAGPUR URBAN SAFETY
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <a className="landing-nav-link landing-nav-active" href="#home">Home</a>
          <a className="landing-nav-link" href="#features">Features</a>
          <Link className="landing-nav-link" to="/trends">Analytics</Link>
          <Link className="landing-nav-link" to="/map">Map</Link>
          <Link className="landing-nav-link" to="/reports">Reports</Link>
          <a className="landing-nav-link" href="#about">About</a>
        </nav>

        <Link to="/dashboard" className="landing-header-cta hidden md:inline-flex">
          Get started <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="relative z-20 mx-5 mb-2 grid gap-1 rounded-xl border border-white/10 bg-[#0b192b] p-3 md:hidden"
        >
          {[
            { label: "Home", href: "#home" },
            { label: "Features", href: "#features" },
            { label: "Analytics", to: "/trends" },
            { label: "Map", to: "/map" },
            { label: "Reports", to: "/reports" },
            { label: "About", href: "#about" },
          ].map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} onClick={closeMenu} className="landing-mobile-link">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} onClick={closeMenu} className="landing-mobile-link">
                {item.label}
              </a>
            ),
          )}
          <Link to="/dashboard" onClick={closeMenu} className="landing-header-cta mt-2 justify-center">
            Get started <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      )}

      <section
        id="home"
        className="landing-hero relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:min-h-[650px] lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:px-12 lg:pb-24 lg:pt-14"
      >
        <div className="relative z-10 max-w-[590px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/[.06] px-3 py-1.5 text-[10px] font-medium tracking-[.12em] text-sky-200 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_#38bdf8]" />
            A CLEARER VIEW OF CITY SAFETY
          </div>
          <h1 className="max-w-[650px] text-[2.8rem] font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-[4.25rem]">
            Safer cities
            <br />
            through smarter
            <br />
            <span className="landing-gradient-text">insights.</span>
          </h1>
          <p className="mt-6 max-w-[500px] text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            Explore crime patterns across Nagpur with clear data, interactive
            maps, and thoughtful analytics—all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="landing-primary-cta">
              Explore the dashboard <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/map" className="landing-secondary-cta">
              Explore crime map <MapIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <a
            href="#features"
            className="mt-8 inline-flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-sky-200"
          >
            Discover what you can explore
            <ArrowDownRightIcon className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-[740px] lg:max-w-none">
          <div className="landing-orbit absolute -inset-5 rounded-[2rem] sm:-inset-9" />
          <div className="relative">
            <DashboardPreview />
            <div className="landing-float-card absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#0c1b2c]/95 p-3 shadow-2xl sm:flex lg:-left-7">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <TrendingUpIcon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-medium text-white">Explore patterns</span>
                <span className="mt-0.5 block text-[9px] text-slate-400">Across time and location</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 border-y border-white/[.07] bg-[#081526]/75"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold tracking-[.18em] text-sky-300 sm:text-xs">
              ONE PLATFORM, MANY PERSPECTIVES
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Understand the bigger picture
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Move from city-wide summaries to the details that matter to you.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, to, color, tone }) => (
              <Link
                key={title}
                to={to}
                className="landing-feature-card group rounded-2xl border border-white/[.08] bg-white/[.025] p-5 transition duration-200 hover:-translate-y-1 hover:border-sky-300/25 hover:bg-white/[.045]"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone} ${color}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-400">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
                  Explore <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="landing-about relative overflow-hidden rounded-3xl border border-sky-300/10 px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[.18em] text-sky-300 sm:text-xs">
              DATA WITH PURPOSE
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Better understanding starts with better visibility.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              CrimeVista brings the available city safety data into focused,
              approachable views—helping people explore trends, places, and
              reports with more context.
            </p>
          </div>
          <Link to="/dashboard" className="landing-primary-cta relative z-10 mt-7 shrink-0 lg:ml-10 lg:mt-0">
            Get started <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-sky-400/[.08] blur-3xl" />
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[.07]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <BrandMark />
            <span>CrimeVista · Nagpur Urban Safety</span>
          </div>
          <p>Explore available crime data with context and care.</p>
          <Link to="/dashboard" className="font-medium text-slate-300 transition hover:text-sky-300">
            Open dashboard <ArrowRightIcon className="ml-1 inline h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </footer>
    </main>
  );
}
