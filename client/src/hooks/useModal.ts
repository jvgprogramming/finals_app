import { useState } from 'react';

export const useModal = <T = any>(initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedUser, setSelectedUser] = useState<T | null>(null);

  const openModal = (user: T | null = null) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  return { isOpen, selectedUser, openModal, closeModal };
};

export default useModal;
