import { useState, useCallback } from 'react';

export interface UseModalStateOptions<T> {
  onClose?: () => void;
  onOpen?: (item?: T) => void;
}

export interface UseModalStateReturn<T> {
  isOpen: boolean;
  selectedItem: T | null;
  open: (item?: T) => void;
  close: () => void;
  toggle: () => void;
  setSelectedItem: (item: T | null) => void;
}

export function useModalState<T = unknown>(
  options: UseModalStateOptions<T> = {}
): UseModalStateReturn<T> {
  const { onClose, onOpen } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback(
    (item?: T) => {
      setIsOpen(true);
      if (item !== undefined) {
        setSelectedItem(item);
      }
      onOpen?.(item);
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const setSelectedItemHandler = useCallback((item: T | null) => {
    setSelectedItem(item);
  }, []);

  return {
    isOpen,
    selectedItem,
    open,
    close,
    toggle,
    setSelectedItem: setSelectedItemHandler,
  };
}

export interface UseConfirmModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  confirm: () => void;
  cancel: () => void;
}

export function useConfirmModal(
  onConfirm: () => void,
  onCancel?: () => void
): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(() => {
    onConfirm();
    close();
  }, [onConfirm, close]);

  const cancel = useCallback(() => {
    onCancel?.();
    close();
  }, [onCancel, close]);

  return {
    isOpen,
    open,
    close,
    confirm,
    cancel,
  };
}
