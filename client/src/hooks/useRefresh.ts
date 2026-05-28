import { useState } from 'react';

export const useRefresh = (initialValue = false) => {
  const [refresh, setRefresh] = useState(initialValue);

  const handleRefresh = () => {
    setRefresh((currentValue) => !currentValue);
  };

  return { refresh, handleRefresh };
};

export default useRefresh;
