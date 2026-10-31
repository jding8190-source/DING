import { Project } from './types';

export const projects: Project[] = [
  {
    id: 'nexa',
    title: 'Nexa: 智能资产管理平台',
    category: '项目应用',
    year: '2024',
    client: 'Nexa Finance',
    description: '专注于个人资本效率的极简金融体验。',
    imageUrl: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=2000',
    overview: 'Nexa 旨在通过人工智能驱动的洞察力，为高净值人士提供一个直观、极简且强大的资产管理平台。在现有的金融工具中，复杂性往往掩盖了决策的效率。',
    role: 'Lead UI/UX Designer',
    goals: [
      '简化复杂的投资组合可视化',
      '建立一个可信赖且具吸引力的精致视觉语言',
      '利用 AI 提供个性化的财务优化建议'
    ],
    process: [
      {
        title: '用户研究与痛点识别',
        description: '我们采访了 15 位目标用户，发现他们对传统移动银行庞杂的功能感到疲惫。他们需要的是一眼就能看清资产流向的“直觉”。',
        imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=1200'
      },
      {
        title: '交互原型设计',
        description: '我们采用了纵向卡片流的设计，将最重要的财务数据置于视觉中心。通过多次迭代，我们将主页的点击层级缩减了 40%。',
        imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=1200'
      }
    ],
    outcomes: [
      'App Store 评分 4.8/5',
      '用户平均停留时间增加 25%',
      '平台管理资产（AUM）在上线首季度增长 3.5 亿'
    ],
    learnings: '对于高端金融产品，少即是多。通过留白和精确的微交互（Micro-interactions）建立的信任感比任何华丽的图表都更有效。',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fexample'
  },
  {
    id: 'horizon',
    title: 'Horizon: 极简旅行导航',
    category: '项目应用',
    year: '2024',
    client: 'Nomad Labs',
    description: '通过空间化界面重新定义探索方式。',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000',
    overview: 'Horizon 是一个为深层次旅行者设计的导航工具，它不提供最快的路径，而是提供最具美感的探索路线。',
    role: 'Product Designer',
    goals: [
      '创造非线性的行程规划体验',
      '整合实时天气与光效预测，优化摄影时机',
      '支持离线模式下的高精度地图渲染'
    ],
    process: [
      {
        title: '视觉风格探索',
        description: '我们选择了能够根据目的地环境色实时变化的流体渐变作为界面背景，使产品本身成为旅行体验的一部分。',
        imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200'
      }
    ],
    outcomes: [
      '获得 2024 Red Dot Design Award 提名',
      '与全球 50+ 个国家公园达成品牌合作',
      '社区生成内容（UGC）沉淀超过 10 万条精品路线'
    ],
    learnings: '在设计移动工具时，环境适应性（Context Awareness）是提升用户体验的核心壁垒。',
  },
  {
    id: 'brand-identity-2024',
    title: 'Etheria 品牌重塑',
    category: '品牌视觉',
    year: '2024',
    client: 'Etheria Tech',
    description: '为科技初创公司打造纯净、通透的品牌视觉体系。',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=2000',
    overview: 'Etheria 需要一个新的品牌形象来传达其“如以太般存在”的轻量化技术理念。',
    role: 'Creative Director',
    goals: ['建立极简的色彩规范', '设计动态化 Logo', '打造跨平台的一致性体验'],
    process: [
      {
        title: '视觉符号推导',
        description: '我们从“流动”与“连接”中提取几何元素，通过数千次的比例调整，确定了最终的品牌图形。',
        imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200'
      },
      {
        title: '通透感材质实验',
        description: '在 UI 层面，我们大量运用毛玻璃效果与动态光影，营造出轻量且富有科技感的视觉张力。',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200'
      }
    ],
    outcomes: ['品牌辨识度提升 60%', '设计系统效率提升 3x'],
    learnings: '品牌不仅仅是 Logo，更是一种情绪的表达。',
  },
  {
    id: 'campaign-spring',
    title: '春季新品发布运营专题',
    category: '运营设计',
    year: '2024',
    client: 'Glow Lifestyle',
    description: '结合动态交互的一站式新品导购体验。',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000',
    overview: '为 Glow 的春季发布会设计的线上互动页面，旨在通过沉浸式视觉引导转化。',
    role: 'Visual Designer',
    goals: ['提高页面转化率', '实现流畅的滚动动画', '适配多端社交媒体端环境'],
    process: [
      {
        title: '叙事化场景构建',
        description: '我们不再是简单的展示产品，而是通过长轮播与视差滚动讲述了一个关于“复苏”的故事。',
        imageUrl: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=1200'
      }
    ],
    outcomes: ['活动点击率（CTR）突破 12%', '总参与人数达 200w+'],
    learnings: '情感化设计能显著拉近品牌与消费者的距离。',
  }
];
