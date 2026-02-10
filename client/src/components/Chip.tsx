import React from 'react'

const Chip = ({
    icon,
    children
}: {
    icon?: React.ReactNode,
    children: React.ReactNode
}) => {
  return (
    <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-2">
      {icon}
      {children}
    </div>
  )
}

export default Chip