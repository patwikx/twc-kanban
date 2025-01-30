import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { Property, Unit } from '@prisma/client';


export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavItemGroup = {
  title: string;
  menuList: SideNavItem[]
}

export interface SidebarItems {
  links: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
  }>;
  extras?: ReactNode;
}


export type PropertyWithUnits = Property & {
  units: Unit[];
};

export type PropertyFormData = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  propertyType: string;
  totalUnits: number;
};

export type UnitFormData = {
  unitNumber: string;
  floorPlanType?: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  status: string;
};