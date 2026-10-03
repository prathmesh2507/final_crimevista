import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={CompassIcon}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={{ label: 'Go to overview', onClick: () => navigate('/dashboard') }} />);


}