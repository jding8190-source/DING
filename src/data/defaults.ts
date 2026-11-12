import type { SiteSettings } from '../types';

// 站点默认文案。管理台保存后由 src/data/content.ts 覆盖，此文件仅作首次回退。
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Ding Jie",
  siteTitle: "Ding Jie — Creative Director & Product Designer",
  logoText: "ZC",
  designerRole: "Creative Director",

  heroHeadline: "DESIGN",
  heroTagline: "Creative Exhibition Lab",
  heroExhibitTag: "PORTFOLIO CURATION 2024-2026",
  heroLocation: "SHANGHAI / TOKYO / REMOTE",
  heroCtaText: "Enter Exhibition",
  heroBgUrl: "./hero_bg.png",

  aboutBio: "聚焦于极简、秩序感与空间深度的跨学科数字体验设计。致力于将尖端科技与高级极简视觉融汇一体，通过克制的排版、通透的光影与精准的交互构建卓越的产品体验。",
  aboutPhilosophy: "优秀的设计不应喧宾夺主，而应如静水深流，在触动使用者的瞬间建立起牢固的情感链接与认知秩序。",
  aboutSkills: ["Design Systems", "Product Architecture", "Spatial UI", "Art Direction", "Motion Prototyping", "Visual Branding"],
  availableStatus: "Available — 2024-2026",

  contactEmail: "jding8190@gmail.com",
  contactWechat: "dingjie_design",
  contactLocation: "Shanghai, China & Remote",
  copyrightText: "© 2024-2026 DING JIE. ALL RIGHTS RESERVED.",

  categories: ["全部", "项目应用", "品牌视觉", "运营设计"],
  adminPasscode: "ding8190",

  heroAboutButtonText: "关于作品 / ABOUT",
  aboutLabel: "Philosophy",
  aboutHeadline: "极致之美来源于",
  aboutHeadlineAccent: "秩序的延伸.",
  aboutExpertiseLabel: "Expertise",
  aboutMeLabel: "About Me",
  aboutImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2000",
  contactBadge: "Contact & Collaboration",
  contactHeadline: "创造更有价值的",
  contactHeadlineAccent: "数字感官体验.",
  contactIntro: "如果您有有趣的项目或合作想法，欢迎随时联系。我一直在寻找能够挑战传统并重塑交互的机会。",
  contactEmailLabel: "Direct Communication / 邮件联络",
  contactWechatLabel: "WeChat 微信",
  contactLocationLabel: "Location 所在地"
};

export const staticExperiences = [
  {
    company: 'Global Creative Studio',
    role: 'Lead Product Designer',
    period: '2021 — Present',
    description: '负责核心产品的视觉系统构建与交互策略定义，主导了多个国际级数字化转型项目，提升用户参与度达 40% 以上。'
  },
  {
    company: 'Innovation Lab',
    role: 'Senior UI/UX Designer',
    period: '2018 — 2021',
    description: '专注于前沿实验性交互设计，在移动端体验与品牌数字化表达领域进行了深入探索，获得多项国际设计奖项。'
  },
  {
    company: 'Art & Tech Collective',
    role: 'Visual Designer',
    period: '2015 — 2018',
    description: '通过跨媒体的设计语言，为科技品牌提供极具叙事感的视觉解决方案，探索艺术与科技的交汇点。'
  }
];
