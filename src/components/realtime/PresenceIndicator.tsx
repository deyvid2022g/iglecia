import React from 'react';
import { Users, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface PresenceIndicatorProps {
  users: User[];
  maxVisible?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  maxVisible = 3,
  showCount = true,
  size = 'md',
  className = ''
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Generate consistent color based on user ID
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={`
              ${sizeClasses[size]} rounded-full border-2 border-white
              flex items-center justify-center font-medium text-white
              ${user.color || getRandomColor(user.id)}
              shadow-sm relative z-${10 - index}
            `}
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
            
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white" />
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className={`
              ${sizeClasses[size]} rounded-full border-2 border-white
              bg-gray-500 flex items-center justify-center font-medium text-white
              shadow-sm
            `}
            title={`${remainingCount} más`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {showCount && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>{users.length}</span>
          <span className="hidden sm:inline">
            {users.length === 1 ? 'persona viendo' : 'personas viendo'}
          </span>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar actividad de usuarios
interface UserActivityProps {
  activities: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
  }>;
  maxVisible?: number;
  className?: string;
}

export const UserActivity: React.FC<UserActivityProps> = ({
  activities,
  maxVisible = 5,
  className = ''
}) => {
  const recentActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxVisible);

  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Actividad reciente
      </h4>
      
      <div className="space-y-1">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between text-xs text-gray-600 py-1"
          >
            <span>
              <strong>{activity.userName}</strong> {activity.action}
            </span>
            <span className="text-gray-400">
              {activity.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresenceIndicator;