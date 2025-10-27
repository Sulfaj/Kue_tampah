'use client';

// Durasi jeda sebelum notifikasi abandoned cart—ubah (dalam ms) sesuai kebijakanmu.
const ABANDONMENT_DELAY_MS = 15 * 60 * 1000;
export const REMINDER_STORAGE_KEY = 'kue-tampah-cart-reminder-sent';
const REMINDER_OPT_IN_STORAGE_KEY = 'kue-tampah-cart-reminder-opt-in';

let reminderTimeout: number | null = null;

// Pesan notifikasi yang muncul ke pengguna—ubah judul/body untuk kampanye yang berbeda.
const reminderNotification = {
  title: 'Pesanan Kue Tampah masih menunggu 🍰',
  body: 'Lanjutkan checkout sekarang sebelum slot pengiriman penuh. Ketuk untuk kembali ke keranjang.',
};

const isBrowser = () => typeof window !== 'undefined';

const getServiceWorkerRegistration = async () => {
  if (!isBrowser() || !('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration ?? (await navigator.serviceWorker.ready);
  } catch {
    return null;
  }
};

const showCartNotification = async () => {
  if (!isBrowser() || !('Notification' in window)) return false;

  if (Notification.permission === 'denied') {
    return false;
  }

  const registration = await getServiceWorkerRegistration();
  if (registration) {
    try {
      await registration.showNotification(reminderNotification.title, {
        body: reminderNotification.body,
        icon: '/favicon.ico',
        tag: 'kue-tampah-cart',
        data: { url: '/cart' },
      });
      return true;
    } catch {
      // fall back to Notification constructor
    }
  }

  try {
    new Notification(reminderNotification.title, {
      body: reminderNotification.body,
      icon: '/favicon.ico',
    });
    return true;
  } catch {
    return false;
  }
};

type NotificationPermissionStatus = NotificationPermission | 'unsupported';

const safeGetItem = (key: string) => {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (!isBrowser() || !('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const cancelAbandonedCartReminder = () => {
  if (reminderTimeout) {
    if (typeof window !== 'undefined') {
      window.clearTimeout(reminderTimeout);
    } else {
      clearTimeout(reminderTimeout);
    }
    reminderTimeout = null;
  }
};

export const storeReminderSent = (value: boolean) => {
  safeSetItem(REMINDER_STORAGE_KEY, value ? 'true' : 'false');
};

export const getReminderOptIn = () => safeGetItem(REMINDER_OPT_IN_STORAGE_KEY) === 'true';

export const setReminderOptIn = (value: boolean) => {
  safeSetItem(REMINDER_OPT_IN_STORAGE_KEY, value ? 'true' : 'false');
};

export const scheduleAbandonedCartReminder = async ({
  lastUpdated,
  onTrigger,
  reminderAlreadySent,
}: {
  lastUpdated: number;
  onTrigger?: () => void;
  reminderAlreadySent: boolean;
}) => {
  if (!isBrowser() || reminderAlreadySent) return;

  cancelAbandonedCartReminder();

  const now = Date.now();
  const delay = Math.max(0, ABANDONMENT_DELAY_MS - (now - lastUpdated));

  const triggerReminder = async () => {
    const shown = await showCartNotification();
    if (shown) {
      storeReminderSent(true);
      onTrigger?.();
    }
  };

  if (delay === 0) {
    await triggerReminder();
    return;
  }

  reminderTimeout = window.setTimeout(() => {
    void triggerReminder();
  }, delay);
};
