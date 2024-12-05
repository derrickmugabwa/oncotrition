import { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-600 text-white py-4 px-6">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default Card

