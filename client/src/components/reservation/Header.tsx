import { Star } from "lucide-react";
import React from "react";

interface HeaderProps {
  cafeName: string;
  cafeLocation: string;
  cafeRating: number;
  cafeTotalReviews?: number;
  cafeImage: string;
  cafePoster: string;
}

const Header = (cafeData: HeaderProps) => {
  return (
    <div
      className="self-stretch px-7 py-6 text-white flex flex-col justify-center items-center gap-5 max-w-175 rounded-t-lg bg-cover bg-center"
      style={{ backgroundImage: `url(${cafeData.cafePoster})` }}
    >
      <div className="self-stretch inline-flex justify-start items-center gap-5">
        <img className="size-20 rounded-[5px]" src={cafeData.cafeImage} />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
          <div className="self-stretch justify-start text-xl font-bold">
            {cafeData.cafeName}
          </div>
          <div className="size- inline-flex justify-start items-center gap-2">
            <div className="justify-start flex flex-row items-center text-base font-regular">
              <img className="size-4 mr-1" src="/icons/star.svg" />
              {cafeData.cafeRating} ({cafeData.cafeTotalReviews ?? 0})
            </div>
            <span className="w-1.5 h-1.5 bg-white rounded-full ml-5"></span>
            <div className="size-1.25 bg-White rounded-full" />
            <div className="justify-start text-base font-regular">
              {cafeData.cafeLocation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
