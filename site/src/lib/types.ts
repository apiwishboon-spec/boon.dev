export interface SocialLink {
  type: string;
  label: string;
  url: string;
  icon?: string;
}

export interface SiteConfig {
  site_title: string;
  brand: string;
  tagline: string;
  footer_text: string;
  copyright: string;
  socials: SocialLink[];
  about: string;
  contact_heading: string;
  contact_subtext: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  enabled: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  cover_url: string;
  tags: string[];
  tech: string[];
  live_url: string;
  github_url: string;
  body: string;
  featured: boolean;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  image_url: string;
  published: boolean;
  tags: string[];
}

export interface Honor {
  id: string;
  title: string;
  description: string;
  image_url: string;
  alt: string;
  badge_class: string;
  badge_icon: string;
  badge_label: string;
  badge_title: string;
  pin_color: string;
  rotation: string;
  sort_order: number;
}

export interface Resource {
  id: string;
  category: string;
  title: string;
  description: string;
  file_url: string;
  preview_url: string;
  file_type: string;
  file_size: string;
  protected: boolean;
  sort_order: number;
}

export interface TimelineMilestone {
  id: string;
  period_label: string;
  title: string;
  description: string;
  icon: string;
  is_current: boolean;
  sort_order: number;
}

export interface Skill {
  id: string;
  label: string;
  sort_order: number;
}
