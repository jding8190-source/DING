export interface ExternalLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string; // Cover image (jpg, png, gif, webp)
  year: string;
  client?: string;
  role?: string;
  overview?: string;
  goals?: string[];
  process?: {
    title: string;
    description: string;
    imageUrl?: string;
  }[];
  outcomes?: string[];
  learnings?: string;
  embedUrl?: string; // Interactive embed (e.g. Figma)
  
  // Rich media enhancements
  images?: string[]; // Multiple gallery images (jpg, png, gif, webp)
  longImages?: string[]; // Long scroll case study images
  videoUrl?: string; // Direct video (mp4, webm) or embed URL
  videoType?: 'direct' | 'embed' | 'bilibili' | 'youtube';
  externalLinks?: ExternalLink[]; // Link buttons (Live demo, Behance, GitHub, App Store, etc.)
  createdAt?: any;
  updatedAt?: any;
}

export interface SiteSettings {
  siteName: string;
  siteTitle: string;
  logoText: string;
  designerRole: string;
  
  // Hero section
  heroHeadline: string;
  heroTagline: string;
  heroExhibitTag: string;
  heroLocation: string;
  heroCtaText: string;
  heroBgUrl?: string;

  // About section
  aboutBio: string;
  aboutPhilosophy: string;
  aboutSkills: string[];
  availableStatus: string;

  // Contact & Footer
  contactEmail: string;
  contactWechat: string;
  contactLocation: string;
  copyrightText: string;

  // Menu Directory Categories
  categories: string[];
}
