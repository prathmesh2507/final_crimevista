import {
  FileTextIcon,
  FlameIcon,
  LayoutDashboardIcon,
  MapIcon,
  MapPinnedIcon,
  SettingsIcon,
  TrendingUpIcon,
  UploadIcon,
  type LucideIcon } from
'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
{
  label: 'Intelligence',
  items: [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboardIcon },
  { to: '/map', label: 'Crime Map', icon: MapIcon },
  { to: '/hotspots', label: 'Hotspots', icon: FlameIcon },
  { to: '/trends', label: 'Trends', icon: TrendingUpIcon },
  { to: '/areas', label: 'Area Explorer', icon: MapPinnedIcon }]

},
{
  label: 'Operations',
  items: [
  { to: '/upload', label: 'Data Upload', icon: UploadIcon },
  { to: '/reports', label: 'Reports', icon: FileTextIcon }]

}];


export const SETTINGS_NAV: NavItem = { to: '/settings', label: 'Settings', icon: SettingsIcon };

export const MOBILE_PRIMARY_NAV: NavItem[] = NAV_GROUPS[0].items.slice(0, 4);

export const MOBILE_MORE_NAV: NavItem[] = [NAV_GROUPS[0].items[4], ...NAV_GROUPS[1].items, SETTINGS_NAV];