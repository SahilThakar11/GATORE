import React from "react";

const ButtonTypesEnum = {
  Primary: "primary",
  Secondary: "secondary",
  Tertiary: "tertiary",
} as const;

type ButtonTypesEnum = (typeof ButtonTypesEnum)[keyof typeof ButtonTypesEnum];

const Button = ({
  type,
  children,
  onClick,
}: {
  type: ButtonTypesEnum;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const bgClass =
    type === ButtonTypesEnum.Primary
      ? "bg-teal-500"
      : type === ButtonTypesEnum.Secondary
        ? "bg-gray-500"
        : type === ButtonTypesEnum.Tertiary
          ? "bg-green-500"
          : "bg-blue-500";
  return (
    <div
      className={`flex items-center justify-center gap-2.5 px-2.5 py-3.5 relative ${bgClass} rounded-md max-w-125 hover:cursor-pointer`}
      onClick={onClick}
    >
      <div className="relative w-fit -mt-px font-bold text-white text-base tracking-[0] leading-[normal] ">
        {children}
      </div>
    </div>
  );
};

export default Button;
