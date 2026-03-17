import React from "react";
import { HeroSection } from "../components/home/HeroSection";
import { FilterBar } from "../components/home/FilterBar";
import { FeaturedCafes } from "../components/home/FeaturedCafes";
import { HowItWorks } from "../components/home/HowItWorks";
import { ReadyToRoll } from "../components/home/ReadyToRoll";

const Home = () => {
  return (
    <div className="bg-[#FFFBF7]">
      <HeroSection />
      <FilterBar />
      <FeaturedCafes city="Toronto" limit={6} />
      <HowItWorks />
      <ReadyToRoll />
    </div>
  );
};

export default Home;
