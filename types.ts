import { ReactNode } from 'react';

export interface NavLink {
  label: string;
  path: string;
}

export interface LayoutProps {
  children: ReactNode;
}
