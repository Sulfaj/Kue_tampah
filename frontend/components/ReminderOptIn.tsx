'use client';

import { useEffect, useState } from 'react';

import {
  cancelAbandonedCartReminder,
  getReminderOptIn,
  requestNotificationPermission,
  storeReminderSent,
  setReminderOptIn,
} from '@/utils/notify';
import { initializeReminderWatcher } from '@/context/CartContext';

const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

type PermissionState = NotificationPermission | 'unsupported';

export const ReminderOptIn = () => {
  const [permission, setPermission] = useState<PermissionState>('unsupported');
  const [enabled, setEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) {
      setPermission('unsupported');
      setEnabled(false);
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    const storedOptIn = getReminderOptIn();
    if (storedOptIn && currentPermission !== 'granted') {
      setReminderOptIn(false);
      setEnabled(false);
      return;
    }

    if (storedOptIn && currentPermission === 'granted') {
      setEnabled(true);
      initializeReminderWatcher();
      return;
    }

    setEnabled(false);
  }, []);

  const handleToggle = async () => {
    if (!isNotificationSupported() || permission === 'unsupported') {
      return;
    }

    if (enabled) {
      setEnabled(false);
      setReminderOptIn(false);
      cancelAbandonedCartReminder();
      storeReminderSent(false);
      return;
    }

    if (permission === 'denied') {
      return;
    }

    setIsProcessing(true);
    const result = await requestNotificationPermission();
    setIsProcessing(false);
    setPermission(result);

    if (result === 'granted') {
      setEnabled(true);
      setReminderOptIn(true);
      storeReminderSent(false);
      initializeReminderWatcher();
      return;
    }

    setEnabled(false);
    setReminderOptIn(false);
    storeReminderSent(false);
  };

  if (permission === 'unsupported') {
    return null;
  }

  const assistanceMessage =
    permission === 'denied'
      ? 'Notifikasi diblokir oleh browser. Aktifkan lewat pengaturan untuk menerima pengingat.'
      : 'Kami akan mengirim notifikasi pengingat 15 menit setelah kamu meninggalkan keranjang.';

  return (
    <div className="mt-6 rounded-[18px] border border-[var(--brand-muted)]/16 bg-[var(--brand-panel)] p-4 text-sm text-[var(--brand-muted)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[var(--brand-black)] font-semibold">Pengingat lewat notifikasi</p>
          <p className="mt-1 text-xs leading-5">{assistanceMessage}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={permission === 'denied' || isProcessing}
          className={`relative inline-flex h-7 w-12 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand-green-400)] ${
            enabled ? 'border-transparent bg-[var(--brand-green-600)]' : 'border-[var(--brand-muted)] bg-white'
          } ${permission === 'denied' ? 'opacity-60' : ''}`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-[22px]' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
