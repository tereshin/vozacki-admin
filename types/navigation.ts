import type { IconName } from "./general";
export interface NavigationItem {
  name: string;
  icon?: IconName;
  link: any;
  badge?: string;
  conditions: any[];
}

export interface NavigationGroup {
  name: string;
  conditions: any[];
  nav: NavigationItem[];
} 