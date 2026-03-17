// This file contains constants that are used across the application.

const NAV_LINKS = [
  { label: "How it works", to: "/how-it-works" },
  { label: "For café owners", to: "/for-cafe-owners" },
];

const GAME_TYPES = [
  {
    id: "strategy",
    label: "Strategy",
    icon: "icons/strategy.svg",
    color: "bg-pink-100 border-pink-200",
  },
  {
    id: "party",
    label: "Party",
    icon: "icons/party.svg",
    color: "bg-purple-100 border-purple-200",
  },
  {
    id: "card",
    label: "Card Games",
    icon: "icons/card_games.svg",
    color: "bg-teal-100 border-teal-200",
  },
  {
    id: "puzzle",
    label: "Puzzle",
    icon: "icons/puzzle.svg",
    color: "bg-blue-100 border-blue-200",
  },
  {
    id: "coop",
    label: "Co-op",
    icon: "icons/coop.svg",
    color: "bg-yellow-100 border-yellow-200",
  },
  {
    id: "rpg",
    label: "RPG",
    icon: "icons/rpg.svg",
    color: "bg-pink-100 border-pink-200",
  },
  {
    id: "educational",
    label: "Educational",
    icon: "icons/educational.svg",
    color: "bg-green-100 border-green-200",
  },
  {
    id: "tableau",
    label: "Tableau",
    icon: "icons/tableau.png",
    color: "bg-orange-100 border-orange-200",
  },
  {
    id: "deduction",
    label: "Deduction",
    icon: "icons/deduction.svg",
    color: "bg-indigo-100 border-indigo-200",
  },
];

const GROUP_SIZES = [
  { id: "any", label: "Any", sublabel: "I play with different groups" },
  { id: "duo", label: "Duo", sublabel: "Just the two of us" },
  { id: "small", label: "Small group", sublabel: "3 – 4 players" },
  { id: "big", label: "Big table", sublabel: "5 or more players" },
];

const COMPLEXITIES = [
  { id: "any", label: "Any", dots: 0 },
  { id: "light", label: "Light", dots: 1 },
  { id: "medium", label: "Medium", dots: 2 },
  { id: "heavy", label: "Heavy", dots: 3 },
];

export { NAV_LINKS, GAME_TYPES, GROUP_SIZES, COMPLEXITIES };
