import {
  Dumbbell, Bike, Activity, Trophy, Medal, Volleyball, Goal,
  Apple, Salad, HeartPulse, Pill, Stethoscope, Droplets, Leaf,
  Book, Brain, GraduationCap, Notebook, Library, Pencil, School,
  Target, Briefcase, Rocket, Laptop, CheckCircle, Calendar, Clipboard,
  Wallet, Coins, PiggyBank, CreditCard, DollarSign, ChartBar,
  Moon, Sunrise, Sparkles, Stars, Flame, Heart,
  Camera, Paintbrush, PenTool, Music, Piano, Mic,
  Bed, Coffee, Home, Flower, TreePalm, ShoppingBag,
  Plane, Car, Map, Compass, Mountain,
  Users, MessageCircle, Handshake, Phone,
  Code, Cpu, Smartphone, Monitor, Database,
  Pizza, Beef, Candy, Cookie, IceCream, Gamepad2, Wifi, AlarmClock, Sofa, Angry, Frown, CircleDot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconDef {
  name: string;
  icon: LucideIcon;
}

export interface IconCategory {
  label: string;
  items: IconDef[];
}

export const HABIT_ICON_CATEGORIES: IconCategory[] = [
  {
    label: 'رياضة',
    items: [
      { name: 'Dumbbell', icon: Dumbbell },
      { name: 'Bike', icon: Bike },
      { name: 'Activity', icon: Activity },
      { name: 'Trophy', icon: Trophy },
      { name: 'Medal', icon: Medal },
      { name: 'Volleyball', icon: Volleyball },
      { name: 'Goal', icon: Goal },
      { name: 'CircleDot', icon: CircleDot },
    ],
  },
  {
    label: 'صحة',
    items: [
      { name: 'Apple', icon: Apple },
      { name: 'Salad', icon: Salad },
      { name: 'HeartPulse', icon: HeartPulse },
      { name: 'Pill', icon: Pill },
      { name: 'Stethoscope', icon: Stethoscope },
      { name: 'Droplets', icon: Droplets },
      { name: 'Leaf', icon: Leaf },
    ],
  },
  {
    label: 'تعلم',
    items: [
      { name: 'Book', icon: Book },
      { name: 'Brain', icon: Brain },
      { name: 'GraduationCap', icon: GraduationCap },
      { name: 'Notebook', icon: Notebook },
      { name: 'Library', icon: Library },
      { name: 'Pencil', icon: Pencil },
      { name: 'School', icon: School },
    ],
  },
  {
    label: 'إنتاجية',
    items: [
      { name: 'Target', icon: Target },
      { name: 'Briefcase', icon: Briefcase },
      { name: 'Rocket', icon: Rocket },
      { name: 'Laptop', icon: Laptop },
      { name: 'CheckCircle', icon: CheckCircle },
      { name: 'Calendar', icon: Calendar },
      { name: 'Clipboard', icon: Clipboard },
    ],
  },
  {
    label: 'مال',
    items: [
      { name: 'Wallet', icon: Wallet },
      { name: 'Coins', icon: Coins },
      { name: 'PiggyBank', icon: PiggyBank },
      { name: 'CreditCard', icon: CreditCard },
      { name: 'DollarSign', icon: DollarSign },
      { name: 'ChartBar', icon: ChartBar },
    ],
  },
  {
    label: 'روحانيات',
    items: [
      { name: 'Moon', icon: Moon },
      { name: 'Sunrise', icon: Sunrise },
      { name: 'Sparkles', icon: Sparkles },
      { name: 'Stars', icon: Stars },
      { name: 'Flame', icon: Flame },
      { name: 'Heart', icon: Heart },
    ],
  },
  {
    label: 'إبداع',
    items: [
      { name: 'Camera', icon: Camera },
      { name: 'Paintbrush', icon: Paintbrush },
      { name: 'PenTool', icon: PenTool },
      { name: 'Music', icon: Music },
      { name: 'Piano', icon: Piano },
      { name: 'Mic', icon: Mic },
    ],
  },
  {
    label: 'نمط حياة',
    items: [
      { name: 'Bed', icon: Bed },
      { name: 'Coffee', icon: Coffee },
      { name: 'Home', icon: Home },
      { name: 'Flower', icon: Flower },
      { name: 'TreePalm', icon: TreePalm },
      { name: 'ShoppingBag', icon: ShoppingBag },
    ],
  },
  {
    label: 'سفر',
    items: [
      { name: 'Plane', icon: Plane },
      { name: 'Car', icon: Car },
      { name: 'Map', icon: Map },
      { name: 'Compass', icon: Compass },
      { name: 'Mountain', icon: Mountain },
    ],
  },
  {
    label: 'اجتماعي',
    items: [
      { name: 'Users', icon: Users },
      { name: 'MessageCircle', icon: MessageCircle },
      { name: 'Handshake', icon: Handshake },
      { name: 'Phone', icon: Phone },
    ],
  },
  {
    label: 'تقنية',
    items: [
      { name: 'Code', icon: Code },
      { name: 'Cpu', icon: Cpu },
      { name: 'Smartphone', icon: Smartphone },
      { name: 'Monitor', icon: Monitor },
      { name: 'Database', icon: Database },
    ],
  },
  {
    label: 'عادات سلبية',
    items: [
      { name: 'Pizza', icon: Pizza },
      { name: 'Beef', icon: Beef },
      { name: 'Candy', icon: Candy },
      { name: 'Cookie', icon: Cookie },
      { name: 'IceCream', icon: IceCream },
      { name: 'Gamepad2', icon: Gamepad2 },
      { name: 'Wifi', icon: Wifi },
      { name: 'AlarmClock', icon: AlarmClock },
      { name: 'Sofa', icon: Sofa },
      { name: 'Angry', icon: Angry },
      { name: 'Frown', icon: Frown },
    ],
  },
];

export const ALL_ICONS: IconDef[] = HABIT_ICON_CATEGORIES.flatMap((c) => c.items);
export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ALL_ICONS.map((i) => [i.name, i.icon])
);

export const HABIT_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Red Light', value: '#f87171' },
  { name: 'Red Dark', value: '#dc2626' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Orange Light', value: '#fb923c' },
  { name: 'Orange Dark', value: '#ea580c' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Amber Light', value: '#fbbf24' },
  { name: 'Amber Dark', value: '#d97706' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Lime Dark', value: '#65a30d' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Green Light', value: '#4ade80' },
  { name: 'Green Dark', value: '#16a34a' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Emerald Dark', value: '#059669' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Teal Dark', value: '#0d9488' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Blue Light', value: '#60a5fa' },
  { name: 'Blue Dark', value: '#2563eb' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Indigo Light', value: '#818cf8' },
  { name: 'Indigo Dark', value: '#4f46e5' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Violet Light', value: '#a78bfa' },
  { name: 'Violet Dark', value: '#7c3aed' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Purple Light', value: '#c084fc' },
  { name: 'Purple Dark', value: '#9333ea' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Fuchsia Dark', value: '#c026d3' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Pink Light', value: '#f472b6' },
  { name: 'Pink Dark', value: '#db2777' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Rose Dark', value: '#e11d48' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Gray Light', value: '#9ca3af' },
  { name: 'Gray Dark', value: '#4b5563' },
] as const;

export function getIconByName(name: string): LucideIcon {
  return ICON_MAP[name] || Flame;
}

export function getHabitIcon(name: string | undefined): LucideIcon {
  return name ? getIconByName(name) : Flame;
}
