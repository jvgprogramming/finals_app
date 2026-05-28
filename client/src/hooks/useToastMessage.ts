import { useState } from 'react';

export const useToastMessage = (
  initialMessage = '',
  initialVisible = false,
  initialFailed = false,
) => {
  const [message, setMessage] = useState(initialMessage);
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isFailed, setIsFailed] = useState(initialFailed);

  const showToastMessage = (nextMessage: string, failed = false) => {
    setMessage(nextMessage);
    setIsFailed(failed);
    setIsVisible(true);
  };

  const closeToastMessage = () => {
    setIsVisible(false);
  };

  return { message, isVisible, isFailed, showToastMessage, closeToastMessage };
};

export default useToastMessage;
