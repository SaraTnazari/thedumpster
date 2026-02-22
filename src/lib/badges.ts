import { Star, Skull, Crown, Flame, Award, Trash2 } from "lucide-react";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  isPremium: boolean;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  reviewCount: number;
  moviesRated: number;
  oneStarCount: number;
  purgatoryVotes: number;
  followersCount: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "trash_panda",
    name: "Trash Panda",
    description: "Rated your first movie",
    icon: Trash2,
    color: "text-primary",
    isPremium: false,
    condition: (stats) => stats.reviewCount >= 1,
  },
  {
    id: "critic",
    name: "Critic",
    description: "Written 10 reviews",
    icon: Star,
    color: "text-yellow-500",
    isPremium: false,
    condition: (stats) => stats.reviewCount >= 10,
  },
  {
    id: "hater",
    name: "Hater",
    description: "Gave 5 movies a score of 1",
    icon: Skull,
    color: "text-red-500",
    isPremium: false,
    condition: (stats) => stats.oneStarCount >= 5,
  },
  {
    id: "connoisseur",
    name: "Connoisseur",
    description: "Rated 50 movies",
    icon: Award,
    color: "text-purple-500",
    isPremium: true,
    condition: (stats) => stats.reviewCount >= 50,
  },
  {
    id: "trash_king",
    name: "Trash King",
    description: "Rated 100 movies",
    icon: Crown,
    color: "text-yellow-400",
    isPremium: true,
    condition: (stats) => stats.reviewCount >= 100,
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Gained 10 followers",
    icon: Flame,
    color: "text-orange-500",
    isPremium: true,
    condition: (stats) => stats.followersCount >= 10,
  },
];
