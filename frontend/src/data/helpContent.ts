export interface HelpSection {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    summary: 'CrimeVista helps you understand city incident patterns, hotspots, and operational response priorities.',
    bullets: [
      'Start with the dashboard to understand citywide volume, trends, and top categories.',
      'Use the map and hotspot views to spot the most urgent areas.',
      'Apply filters to isolate a specific severity, area, time period, or crime type.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    summary: 'The Executive Overview is the starting point for a quick safety assessment.',
    bullets: [
      'KPIs show the current incident count, distribution, and citywide change indicators.',
      'Monthly trends reveal whether activity is rising, falling, or concentrated in a short window.',
      'Insights panel highlights the biggest operational takeaways from the filtered data.',
    ],
  },
  {
    id: 'crime-map',
    title: 'Crime Map',
    summary: 'Explore individual incidents geographically and compare their severity and location.',
    bullets: [
      'Each point represents a recorded incident when coordinates are available.',
      'The cluster toggle groups nearby markers so dense areas are easier to inspect.',
      'The side panel reveals the exact incident detail for the selected point.',
    ],
  },
  {
    id: 'hotspots',
    title: 'Hotspots',
    summary: 'Hotspots surface the areas with the highest concentration of incidents.',
    bullets: [
      'Rankings combine incident count, density, and high-severity burden.',
      'Risk level helps prioritize areas for intervention, monitoring, or a deeper review.',
      'Open an area directly from the map or ranking table to inspect its local profile.',
    ],
  },
  {
    id: 'trends',
    title: 'Trends',
    summary: 'Trends show how crime patterns shift over time and across categories.',
    bullets: [
      'Use time series to compare current and previous periods.',
      'Breakdowns by crime type, severity, and area keep the change narrative grounded in context.',
      'Use the filter controls to focus on a date window or subset of incidents.',
    ],
  },
  {
    id: 'area-explorer',
    title: 'Area Explorer',
    summary: 'Area Explorer compares a chosen area against the broader city pattern.',
    bullets: [
      'See which crime types dominate in a local area.',
      'Review patrol-relevant summaries such as hotspots and severity mix.',
      'Compare monthly movement to determine whether the pattern is unusually concentrated or temporary.',
    ],
  },
  {
    id: 'data-upload',
    title: 'Data Upload',
    summary: 'Upload a fresh CSV to refresh the active operating dataset.',
    bullets: [
      'The system validates the file format and required columns before import.',
      'Rejected rows are counted separately so the quality issue is visible.',
      'The upload status tracks validation, import, and completion details in real time.',
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    summary: 'Reports package KPIs, chart summaries, and incident snapshots for downstream review.',
    bullets: [
      'Select the sections and report format that matter for your audience.',
      'Filters decide which slice of the dataset is included in the final output.',
      'Use exports for briefings, planning meetings, and operations reviews.',
    ],
  },
  {
    id: 'filters',
    title: 'Filters',
    summary: 'Filters are the fastest way to narrow the dataset to the area or time window you need.',
    bullets: [
      'Filter by crime type, area, severity, and time period.',
      'Use date ranges to compare the current period to a prior period.',
      'Reset filters when you want to return to the full citywide view.',
    ],
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    summary: 'The CrimeVista AI panel answers common questions about the app and its current context.',
    bullets: [
      'The assistant uses the current page, filters, and selected area when available.',
      'If no external model is configured, it falls back to CrimeVista-specific guidance built into the app.',
      'Use it to get quick explanations without leaving the current workflow.',
    ],
  },
  {
    id: 'risk-levels',
    title: 'Understanding Risk Levels',
    summary: 'Risk levels help answer where intervention may be most important.',
    bullets: [
      'High risk usually means concentration, repeat incidents, and a greater severity burden.',
      'Watch multiple indicators together instead of only a single value.',
      'Use the risk score to prioritise area review, patrol allocation, and response planning.',
    ],
  },
  {
    id: 'severity',
    title: 'Understanding Severity',
    summary: 'Severity indicates the seriousness of each incident or pattern, not simply frequency.',
    bullets: [
      'Critical and high-severity events receive more attention in the analytics and ranking logic.',
      'Patterns on the map should be read alongside severity to avoid focusing on volume alone.',
      'Use the severity split to understand whether the issue is broad or concentrated in a few serious events.',
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    summary: 'Answering the common questions from first-time users.',
    bullets: [
      'CrimeVista is designed for city-scale crime intelligence and works with the active dataset uploaded into the app.',
      'If the AI provider is not configured, the built-in fallback explains the app without failing.',
      'The Help page explains each section so you can navigate the platform with less trial and error.',
    ],
  },
];
