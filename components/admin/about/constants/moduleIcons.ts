import {
  BeakerIcon, ChartPieIcon, ClipboardDocumentListIcon, 
  HeartIcon, AcademicCapIcon, UserGroupIcon, 
  SparklesIcon, ShieldCheckIcon, RocketLaunchIcon,
  BookOpenIcon, BoltIcon, CalendarIcon,
  ChartBarIcon, CloudIcon, CogIcon, CommandLineIcon,
  CpuChipIcon, DocumentTextIcon, FireIcon,
  GlobeAltIcon, LinkIcon, ListBulletIcon,
  MagnifyingGlassIcon, MapIcon, MusicalNoteIcon,
  PresentationChartBarIcon, ServerIcon,
  StarIcon, SunIcon, TableCellsIcon, TagIcon,
  TrophyIcon, VideoCameraIcon, WrenchIcon
} from '@heroicons/react/24/outline';

export const ICON_CATEGORIES = [
  {
    name: 'Education & Learning',
    icons: [
      { name: 'Academic', icon: AcademicCapIcon },
      { name: 'Book', icon: BookOpenIcon },
      { name: 'Presentation', icon: PresentationChartBarIcon },
      { name: 'Rocket', icon: RocketLaunchIcon },
      { name: 'Star', icon: StarIcon },
    ]
  },
  {
    name: 'Health & Wellness',
    icons: [
      { name: 'Heart', icon: HeartIcon },
      { name: 'Shield', icon: ShieldCheckIcon },
      { name: 'Sun', icon: SunIcon },
      { name: 'Trophy', icon: TrophyIcon },
      { name: 'Sparkles', icon: SparklesIcon },
    ]
  },
  {
    name: 'Data & Analytics',
    icons: [
      { name: 'Chart-Pie', icon: ChartPieIcon },
      { name: 'Chart-Bar', icon: ChartBarIcon },
      { name: 'List', icon: ListBulletIcon },
      { name: 'Table', icon: TableCellsIcon },
      { name: 'Clipboard', icon: ClipboardDocumentListIcon },
    ]
  },
  {
    name: 'Technology',
    icons: [
      { name: 'Chip', icon: CpuChipIcon },
      { name: 'Cloud', icon: CloudIcon },
      { name: 'Cog', icon: CogIcon },
      { name: 'Command', icon: CommandLineIcon },
      { name: 'Server', icon: ServerIcon },
    ]
  },
  {
    name: 'Features & Tools',
    icons: [
      { name: 'Bolt', icon: BoltIcon },
      { name: 'Fire', icon: FireIcon },
      { name: 'Wrench', icon: WrenchIcon },
      { name: 'Tag', icon: TagIcon },
      { name: 'Beaker', icon: BeakerIcon },
    ]
  },
  {
    name: 'Content & Media',
    icons: [
      { name: 'Document', icon: DocumentTextIcon },
      { name: 'Globe', icon: GlobeAltIcon },
      { name: 'Link', icon: LinkIcon },
      { name: 'Video', icon: VideoCameraIcon },
      { name: 'Calendar', icon: CalendarIcon },
    ]
  },
];

export const ALL_ICONS = ICON_CATEGORIES.reduce((acc, category) => [...acc, ...category.icons], [] as typeof ICON_CATEGORIES[0]['icons']);

export type IconType = (typeof ALL_ICONS)[0];
