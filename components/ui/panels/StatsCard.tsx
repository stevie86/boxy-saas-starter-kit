import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-3xl font-bold">{value}</p>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
