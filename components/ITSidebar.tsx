"use client";

import Sidebar, { type SidebarProps } from "./Sidebar";

export default function ITSidebar(props: SidebarProps) {
  return <Sidebar variant="it" {...props} />;
}

export { ITSidebar };
