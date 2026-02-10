import React from 'react'
import Chip from './Chip'

const GameCard = () => {
  return (
    <div className="flex grow gap-5 p-5 bg-gray-200 border border-gray-300 rounded-lg">
        <img src="/src/assets/React.svg" alt="Game" width="107" height="107" className="rounded-lg"/>
        <div className="flex grow flex-col gap-5">
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    // icon here
                    <h2 className="font-bold">Game Title</h2>
                </div>
                <div className="flex items-center gap-2">
                    // icon here
                    <span className="text-sm text-gray-500">Difficulty</span>
                </div>
            </div>
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    // icon here
                    <h2 className="text-sm">Players</h2>
                </div>
                <div className="flex items-center gap-2">
                    // icon here
                    <span className="text-sm text-gray-500">Time</span>
                </div>
            </div>
            <div className="flex gap-3">
                <Chip icon={<img src="/src/assets/React.svg" alt="Icon" width="16" height="16"/>}>Default Chip</Chip>
                <Chip icon={<img src="/src/assets/React.svg" alt="Icon" width="16" height="16"/>}>Default Chip</Chip>
            </div>
        </div>
    </div>
  )
}

export default GameCard